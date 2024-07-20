from modal import (
    Image,
    App,
    method,
    asgi_app,
    functions,
    enter,
)
from fastapi import Query, Request, FastAPI, responses
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import moviepy.editor as mp
import requests

MODEL_DIR = "/model"
web_app = FastAPI()
web_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def download_model():
    from huggingface_hub import snapshot_download
    snapshot_download("openai/whisper-large-v3", local_dir=MODEL_DIR)

image = (
    Image.from_registry("nvidia/cuda:12.1.0-cudnn8-devel-ubuntu22.04", add_python="3.9")
    .apt_install("git", "ffmpeg")
    .pip_install(
        "transformers",
        "ninja",
        "packaging",
        "wheel",
        "torch",
        "hf-transfer~=0.1",
        "ffmpeg-python",
        "requests",
        "moviepy",
    )
    .run_commands("python -m pip install flash-attn --no-build-isolation", gpu="A10G")
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
    .run_function(
        download_model,
    )
)

app = App("whisper-v3")

@app.cls(
    image=image,
    gpu="A10G",
    allow_concurrent_inputs=80,
    container_idle_timeout=40,
)
class WhisperV3:
    @enter()
    def setup(self):
        import torch
        from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
        model = AutoModelForSpeechSeq2Seq.from_pretrained(
            MODEL_DIR,
            torch_dtype=self.torch_dtype,
            use_safetensors=True,
            use_flash_attention_2=True,
        )
        processor = AutoProcessor.from_pretrained(MODEL_DIR)
        model.to(self.device)
        self.pipe = pipeline(
            "automatic-speech-recognition",
            model=model,
            tokenizer=processor.tokenizer,
            feature_extractor=processor.feature_extractor,
            max_new_tokens=128,
            chunk_length_s=30,
            batch_size=8,
            stride_length_s=5,
            return_timestamps=True,
            torch_dtype=self.torch_dtype,
            model_kwargs={"use_flash_attention_2": True},
            device=0,
        )

    @method()
    def generate(self, audio_file: str):
        import time
        start = time.time()
        output = self.pipe(
            audio_file, chunk_length_s=30, batch_size=8, return_timestamps=True, stride_length_s=5
        )
        elapsed = time.time() - start
        return output, elapsed

@web_app.post("/transcribe")
async def transcribe(request: Request, video_url: str = Query(...)):
    print("Received a request from", request.client)

    video_response = requests.get(video_url)
    video_fp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    video_fp.write(video_response.content)
    video_fp.close()

    video = mp.VideoFileClip(video_fp.name)
    audio_fp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    video.audio.write_audiofile(audio_fp.name)
    
    with open(audio_fp.name, "rb") as f:
        audio_content = f.read()

    model = WhisperV3()
    call = model.generate.spawn(audio_content)
    return {"call_id": call.object_id}

@web_app.get("/stats")
def stats(request: Request):
    print("Received a request from", request.client)
    model = WhisperV3()
    f = model.generate
    return f.get_current_stats()

@web_app.get("/call_id")
async def get_completion(request: Request):
    call_id = request.query_params.get("call_id")
    if not call_id:
        return responses.JSONResponse(content="Missing call_id parameter", status_code=400)

    f = functions.FunctionCall.from_id(call_id)
    try:
        result = f.get(timeout=0)
    except TimeoutError:
        return responses.JSONResponse(
            content="Result did not finish processing.", status_code=202
        )
    return result

@app.function(allow_concurrent_inputs=4, image=image)
@asgi_app()
def entrypoint():
    return web_app
