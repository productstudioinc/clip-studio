# ---
# cmd: ["modal", "serve", "06_gpu_and_ml/comfyui/comfyapp.py"]
# deploy: true
# ---
#
# # Run Flux on ComfyUI interactively and as an API
#
# [ComfyUI](https://github.com/comfyanonymous/ComfyUI) is an open-source Stable Diffusion GUI with a graph/nodes based interface that allows you to design and execute advanced image generation pipelines.

# Flux is a family of cutting-edge text-to-image models created by [black forest labs](https://huggingface.co/black-forest-labs), rapidly gaining popularity due to their exceptional image quality.
#
# In this example, we show you how to
#
# 1. run Flux on ComfyUI interactively to develop workflows
#
# 2. serve a Flux ComfyUI workflow as an API
#
# Combining the UI and the API in a single app makes it easy to iterate on your workflow even after deployment.
# Simply head to the interactive UI, make your changes, export the JSON, and redeploy the app.
#
# ## Quickstart
#
# This example runs `workflow_api.json` in this directory, which is an adapation of [this simple FLUX.1-schnell workflow](https://openart.ai/workflows/reverentelusarca/flux-simple-workflow-schnell/40OkdaB23J2TMTXHmxxu) with an Image Resize custom node added at the end.
#
# For the prompt `"Surreal dreamscape with floating islands, upside-down waterfalls, and impossible geometric structures, all bathed in a soft, ethereal light"`
# we got this output:
#
# ![example comfyui image](./flux_gen_image.jpeg)
#
# To serve the workflow in this example as an API:
# 1. Stand up the ComfyUI server in development mode:
# ```bash
# modal serve 06_gpu_and_ml/comfyui/comfyapp.py
# ```
# Note: if you're running this for the first time, it will take several minutes to build the image, since we have to download the Flux models (>20GB) to the container. Successive calls will reuse this prebuilt image.
#
# 2. In another terminal, run inference:
# ```bash
# python 06_gpu_and_ml/comfyui/comfyclient.py --dev --modal-workspace $(modal profile current) --prompt "neon green sign that says Modal"
# ```
#
# The first inference will take ~1m since the container needs to launch the ComfyUI server and load Flux into memory. Successive inferences on a warm container should take a few seconds.
#
# ## Setup
#

import json
import subprocess
import uuid
from pathlib import Path
from typing import Dict

import modal
from modal import (
    Image,
    App,
    Mount,
    web_server,
    method,
    asgi_app,
    functions,
    enter,
)
from fastapi import Query, Request, FastAPI, responses, Response
# from fastapi.middleware.cors import CORSMiddleware
# import tempfile
# import moviepy.editor as mp
# import requests
# import math

# ### Building up the environment
#
# ComfyUI setups can be complex, with a lot of custom nodes and models to manage.
# We'll use [`comfy-cli`](https://github.com/Comfy-Org/comfy-cli) to manage the installation of ComfyUI, its dependencies, models, and custom nodes.
#
# We start from a base image and specify all of our dependencies.
# We'll call out the interesting ones as they come up below.
#
# Note that these dependencies are not installed locally.
# They are only installed in the remote environment where our app runs.
# This happens the first time. On subsequent runs, the cached image will be reused.


cuda_version = "12.4.0"  # should be no greater than host CUDA version
flavor = "devel"  #  includes full CUDA toolkit
operating_sys = "ubuntu22.04"
tag = f"{cuda_version}-{flavor}-{operating_sys}"



image = (  # build up a Modal Image to run ComfyUI, step by step
    # modal.Image.from_registry(f"nvidia/cuda:{tag}", add_python="3.11").entrypoint([])
    modal.Image.from_registry("nvcr.io/nvidia/pytorch:24.10-py3", add_python="3.11")
    .apt_install("git", "clang", "ffmpeg")  # install git to clone ComfyUI
    .pip_install("fastapi[standard]==0.115.4")  # install web dependencies
    .pip_install("comfy-cli==1.2.7")  # install comfy-cli
    .pip_install([
        "packaging",
        "wheel",
        "setuptools",
        "numpy===1.26.4",
    ])
    # Then install the rest of the dependencies
    .pip_install([
        "torch",
        "accelerate",
        "tensorflow",
        "tensorboard",
        "opencv-python",
        "soundfile",
        "mmpose",
        "tqdm",
        "more-itertools",
        "ffmpeg-python>=0.2.0",
        "pydub",
    ])
    # .pip_install("flash-attn==2.6.3", extra_options="--no-build-isolation")
    .run_commands(  # use comfy-cli to install the ComfyUI repo and its dependencies
        "comfy --skip-prompt install --nvidia"
    )

)

image = (
    image
    # .run_commands(  # add flash-attn
    #     "pip install flash-attn --no-build-isolation"
    # )
  
)

# #### Downloading models
#
# We'll download the Flux models using `comfy-cli`.
# ComfyUI will look for these models in the `models` subdirectory under specific subdirectories
# (e.g. `vae`, `unet`, `clip`, etc.), so we need to download them into the correct location.
#
# You can run multiple commands using comma separated commands in `.run_commands()`.
# But here we opt to split them up to allow for more granular layer caching in the Modal Image.
# By appending a model install using `.run_commands(...)` at the end of this build step we ensure
# that the previous steps remain un-changed and will be cached, avoiding unnecessary re-runs.

image = (
    image
    # .run_commands(
    #     "comfy --skip-prompt model download --url https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp8_e4m3fn.safetensors --relative-path models/clip"
    # )
    # .run_commands(
    #     "comfy --skip-prompt model download --url https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/clip_l.safetensors --relative-path models/clip"
    # )
    # .run_commands(
    #     "comfy --skip-prompt model download --url https://huggingface.co/black-forest-labs/FLUX.1-schnell/resolve/main/ae.safetensors --relative-path models/vae"
    # )
    # .run_commands(
    #     "comfy --skip-prompt model download --url https://huggingface.co/black-forest-labs/FLUX.1-schnell/resolve/main/flux1-schnell.safetensors --relative-path models/unet"
    # )
    .run_commands(
        "comfy --skip-prompt model download --url https://huggingface.co/fudan-generative-ai/hallo2/resolve/main/realesrgan/RealESRGAN_x2plus.pth --relative-path models/upscale_models"
    )
    # .run_commands(
    #     "comfy --skip-prompt model download --url https://huggingface.co/fudan-generative-ai/hallo2/resolve/main/facelib/detection_Resnet50_Final.pth --relative-path models/facelib"
    # )
    # Add .run_commands(...) calls for any other models you want to download
    # .run_commands(
    #     "comfy --skip-prompt model download --url https://huggingface.co/TMElyralab/MuseTalk/resolve/main/musetalk/pytorch_model.bin --relative-path models/musetalk"
    # )
    # .run_commands(
    #     "comfy --skip-prompt model download --url https://huggingface.co/TMElyralab/MuseTalk/resolve/main/musetalk/musetalk.json --relative-path models/musetalk"
    # )

)

image = (
    image
    .run_commands(
        "comfy --skip-prompt model download --url https://huggingface.co/yzd-v/DWPose/blob/main/dw-ll_ucoco_384.pth --relative-path models/diffusers/TMElyralab/MuseTalk/dwpose"
    )
    .run_commands(
        "comfy --skip-prompt model download --url https://huggingface.co/ManyOtherFunctions/face-parse-bisent/resolve/main/79999_iter.pth --relative-path models/diffusers/TMElyralab/MuseTalk/face-parse-bisent"
    )
    .run_commands(
        "comfy --skip-prompt model download --url https://download.pytorch.org/models/resnet18-5c106cde.pth --relative-path models/diffusers/TMElyralab/MuseTalk/vae"
    )
    .run_commands(
        "comfy --skip-prompt model download --url https://huggingface.co/stabilityai/sd-vae-ft-mse/resolve/main/config.json --relative-path models/diffusers/TMElyralab/MuseTalk/vae"
    )
    .run_commands(
        "comfy --skip-prompt model download --url https://huggingface.co/stabilityai/sd-vae-ft-mse/resolve/main/diffusion_pytorch_model.bin --relative-path models/diffusers/TMElyralab/MuseTalk/vae"
    )
)

# To download gated models that require a Hugging Face token (e.g. Flux Dev), add `--set-hf-api-token=<your_token>` to your `comfy model download` command.

# #### Downloading custom nodes
#
# We'll download custom nodes using `comfy-cli` too.
# Alternatively, you can install them by cloning the git repositories to your `/root/comfy/ComfyUI/custom_nodes`
# directory and installing the required dependencies manually.
#
# Similarly to models, we opt to split the custom node installation into separate `.run_commands(...)` calls
# to allow for more granular layer caching.

image = (
    image.run_commands(  # download a custom node
        "comfy node install image-resize-comfyui"
    )
    .run_commands(
        "comfy node install ComfyUI-VideoHelperSuite"
    )
  
    # Add .run_commands(...) calls for any other custom nodes you want to download
)

# #### Adding more dependencies
#
# To add more dependencies, models or custom nodes without having to rebuild the entire image
# it's recommended to append them at the end of your image build rather than modifying previous steps.
# This allows you to cache all previous steps and only build the new steps when you make changes to the image.

image = (
    image  # Add any additional steps here
    # .run_commands(...)
    # .run_commands(
    #     "git clone https://github.com/TMElyra/musetalk.git /root/musetalk && cd /root/musetalk && pip install -e ."
    # )
    .pip_install(
        "omegaconf",
    )
    .pip_install("protobuf==3.20.3")  # Add this line
    # .pip_install(
    #     "facenet-pytorch", extra_options="--no-deps"
    # )
    .pip_install(
        "diffusers",
        'yapf',
        'addict',
        # 'pytorch',
        # 'torchvision', 
        # 'torchaudio',
        'torchvision==0.15.2',
        'torch==2.0.1',
        'torchaudio==2.0.2',
        extra_options='--extra-index-url https://download.pytorch.org/whl/cu121'
    )
    .pip_install("openmim", extra_options="--no-cache-dir -U")
    .run_commands(
        "mim install mmengine --no-deps && "
        "mim install 'mmcv==2.0.1' --no-deps && "
        "mim install 'mmdet==3.2.0' --no-deps && "
        "mim install 'mmpose==1.1.0' --no-deps"
    )
    # .apt_install(...)
)

image = (
    image
    # .run_commands(
    #     # First remove any existing installation
    #     "rm -rf /root/comfy/ComfyUI/custom_nodes/ComfyUI-MuseTalk"
    # )
    .run_commands(
        # Now install the ComfyUI custom node
        "comfy node install ComfyUI-MuseTalk"
    )
    .run_commands(

        # Original repo doesn't have this file
        "touch /root/comfy/ComfyUI/custom_nodes/ComfyUI-MuseTalk/musetalk/__init__.py"
    )
    
 
)

image = (
    image
    .pip_install(
        "pycocotools",
        "shapely",
        "terminaltables",
    )
)
# #### Create the app
#
# We create the app and specify the image we built above.

app = App(name="example-comfyui", image=image)

# ## Running ComfyUI interactively and as an API on Modal
#
# To run ComfyUI interactively, simply wrap the `comfy launch` command in a Modal Function and serve it as a web server.


@app.function(
    allow_concurrent_inputs=10,
    concurrency_limit=1,
    container_idle_timeout=30,
    timeout=1800,
    gpu="A100",
)
@modal.web_server(8000, startup_timeout=60)
def ui():
    subprocess.Popen("comfy launch -- --listen 0.0.0.0 --port 8000", shell=True)


# Remember to **close your UI tab** when you are done developing to avoid accidental charges to your account.
# This will close the connection with the container serving ComfyUI, which will spin down based on your `container_idle_timeout` setting.
#
# To run an existing workflow as an API, we use Modal's class syntax to run our customized ComfyUI environment and workflow on Modal.
#
# Here's the basic breakdown of how we do it:
# 1. We stand up a "headless" ComfyUI server in the background when the app starts.
# 2. We define an `infer` method that takes in a workflow path and runs the workflow on the ComfyUI server.
# 3. We stand up an `api` with `web_endpoint`, so that we can run our workflows as a service.
#
# For more on how to run web services on Modal, check out [this guide](https://modal.com/docs/guide/webhooks).
@app.cls(
    allow_concurrent_inputs=10,
    container_idle_timeout=300,
    gpu="A100",
    mounts=[
        Mount.from_local_file(
            Path(__file__).parent / "workflow_api.json",
            "/root/workflow_api.json",
        ),
    ],
)
class ComfyUI:
    @modal.enter()
    def launch_comfy_background(self):
        cmd = "comfy launch --background"
        subprocess.run(cmd, shell=True, check=True)

    @modal.method()
    def infer(self, workflow_path: str = "/root/workflow_api.json"):
        # runs the comfy run --workflow command as a subprocess
        cmd = f"comfy run --workflow {workflow_path} --wait --timeout 1200"
        subprocess.run(cmd, shell=True, check=True)

        # completed workflows write output images to this directory
        output_dir = "/root/comfy/ComfyUI/output"
        # looks up the name of the output image file based on the workflow
        workflow = json.loads(Path(workflow_path).read_text())
        file_prefix = [
            node.get("inputs")
            for node in workflow.values()
            if node.get("class_type") == "SaveImage"
        ][0]["filename_prefix"]

        # returns the image as bytes
        for f in Path(output_dir).iterdir():
            if f.name.startswith(file_prefix):
                return f.read_bytes()

    @modal.web_endpoint(method="POST")
    def api(self, item: Dict):
        from fastapi import Response

        workflow_data = json.loads(
            (Path(__file__).parent / "workflow_api.json").read_text()
        )

        # insert the prompt
        workflow_data["6"]["inputs"]["text"] = item["prompt"]

        # give the output image a unique id per client request
        client_id = uuid.uuid4().hex
        workflow_data["9"]["inputs"]["filename_prefix"] = client_id

        # save this updated workflow to a new file
        new_workflow_file = f"{client_id}.json"
        json.dump(workflow_data, Path(new_workflow_file).open("w"))

        # run inference on the currently running container
        img_bytes = self.infer.local(new_workflow_file)

        return Response(img_bytes, media_type="image/jpeg")


# ### The workflow for developing workflows
#
# When you run this script with `modal deploy 06_gpu_and_ml/comfyui/comfyapp.py`, you'll see a link that includes `ui`.
# Head there to interactively develop your ComfyUI workflow. All of your models and custom nodes specified in the image build step will be loaded in.
#
# To serve the workflow after you've developed it, first export it as "API Format" JSON:
# 1. Click the gear icon in the top-right corner of the menu
# 2. Select "Enable Dev mode Options"
# 3. Go back to the menu and select "Save (API Format)"
#
# Save the exported JSON to the `workflow_api.json` file in this directory.
#
# Then, redeploy the app with this new workflow by running `modal deploy 06_gpu_and_ml/comfyui/comfyapp.py` again.
#
# ## Further optimizations
# - To decrease inference latency, you can process multiple inputs in parallel by setting `allow_concurrent_inputs=1`, which will run each input on its own container. This will reduce overall response time, but will cost you more money. See our [Scaling ComfyUI](https://modal.com/blog/scaling-comfyui) blog post for more details.
# - If you're noticing long startup times for the ComfyUI server (e.g. >30s), this is likely due to too many custom nodes being loaded in. Consider breaking out your deployments into one App per unique combination of models and custom nodes.
# - For those who prefer to run a ComfyUI workflow directly as a Python script, see [this blog post](https://modal.com/blog/comfyui-prototype-to-production).