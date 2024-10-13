import io
import modal
from diffusers import DiffusionPipeline, DPMSolverSinglestepScheduler

sdxl_image = modal.Image.debian_slim(python_version="3.10").apt_install(
        "libglib2.0-0", 
        "libsm6", 
        "libxrender1", 
        "libxext6", 
        "ffmpeg", 
        "libgl1",
    ).pip_install(
        "diffusers==0.26.3",
        "invisible_watermark==0.2.0",
        "transformers~=4.38.2",
        "accelerate==0.27.2",
        "safetensors==0.4.2",
    )

app = modal.App('sdxl')

with sdxl_image.imports():
    import os
    import torch
    from diffusers import DiffusionPipeline, DPMSolverSinglestepScheduler
    from fastapi import Response, Header

@app.cls(gpu=modal.gpu.A100(), container_idle_timeout=240, image=sdxl_image, timeout=120, secrets=[modal.Secret.from_name("flux.1-secret")])
class Model:
    @modal.build()
    def build(self):
        from huggingface_hub import snapshot_download

        ignore = [
            "*.bin",
            "*.onnx_data",
            "*/diffusion_pytorch_model.safetensors",
        ]
        snapshot_download(
            "stabilityai/stable-diffusion-xl-base-1.0", ignore_patterns=ignore
        )
        snapshot_download(
            "stabilityai/stable-diffusion-xl-refiner-1.0",
            ignore_patterns=ignore,
        )

    @modal.enter()
    def enter(self):
        load_options = dict(
            torch_dtype=torch.float16,
            use_safetensors=True,
            variant="fp16",
            device_map="auto",
        )

        self.base = DiffusionPipeline.from_pretrained(
            "stabilityai/stable-diffusion-xl-base-1.0", **load_options
        )

        self.refiner = DiffusionPipeline.from_pretrained(
            "stabilityai/stable-diffusion-xl-refiner-1.0",
            text_encoder_2=self.base.text_encoder_2,
            vae=self.base.vae,
            **load_options,
        )

        karras_scheduler = DPMSolverSinglestepScheduler.from_config(self.base.scheduler.config, use_karras_sigmas=True)
        self.base.scheduler = karras_scheduler
        self.refiner.scheduler = karras_scheduler

    def inference(self, prompt: str, negative_prompt: str, width: int = 1024, height: int = 1024, high_noise_frac: float = 0.8):
        image = self.base(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=30,
            denoising_end=high_noise_frac,
            output_type="latent",
            width=width,
            height=height,
        ).images
        
        image = self.refiner(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=30,
            denoising_start=high_noise_frac,
            image=image,
        ).images[0]

        byte_stream = io.BytesIO()
        image.save(byte_stream, format="PNG")

        return byte_stream.getvalue()
    
    @modal.method()
    def _inference(self, prompt: str, negative_prompt: str = "disfigured, ugly, deformed, noisy, blurry", width: int = 1024, height: int = 1024, high_noise_frac: float = 0.8):
        return self.inference(prompt, negative_prompt, width, height, high_noise_frac)
    
    @modal.web_endpoint(docs=True)
    def web_inference(self, prompt: str, negative_prompt: str = "disfigured, ugly, deformed", width: int = 1024, height: int = 1024, high_noise_frac: float = 0.8, x_api_key: str = Header(None)):
        api_key = os.getenv("API_KEY")
        if x_api_key != api_key:
            return Response(content="Unauthorized", status_code=401)

        image = self.inference(prompt, negative_prompt, width, height, high_noise_frac)
        return Response(content=image, media_type="image/png")
    
@app.local_entrypoint()
def main(prompt: str = "A beautiful sunset over the mountains"):
    image_bytes = Model()._inference.remote(prompt)

    with open("output.png", "wb") as f:
        f.write(image_bytes)
