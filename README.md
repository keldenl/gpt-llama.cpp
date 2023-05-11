# gpt-llama.cpp

<p align="center">
   <img src="https://raw.githubusercontent.com/keldenl/gpt-llama.cpp/master/docs/assets/gpt-llama.jpeg" width="250"  alt="gpt-llama.cpp logo">
</p>
<p align="center">
   <a href="https://discord.gg/aWHBQnJaFC"><img src="https://img.shields.io/discord/1098490114893680652" alt="discord"></a>
   <a href="https://www.npmjs.com/package/gpt-llama.cpp"><img src="https://img.shields.io/npm/v/gpt-llama.cpp" alt="npm version"></a>
   <a href="https://www.npmjs.com/package/gpt-llama.cpp"><img src="https://img.shields.io/npm/dw/gpt-llama.cpp" alt="npm downloads"></a>
   <a href="https://github.com/keldenl/gpt-llama.cpp/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/gpt-llama.cpp" alt="license"></a>
</p>
<p align="center">
   Replace OpenAi's GPT APIs with <a href="https://github.com/ggerganov/llama.cpp">llama.cpp</a>'s <a href="https://github.com/ggerganov/llama.cpp#description">supported models</a> locally
</p>

## Demo

![Demo GIF](https://raw.githubusercontent.com/keldenl/gpt-llama.cpp/master/docs/assets/demo.gif)
_Real-time speedy interaction mode demo of using `gpt-llama.cpp`'s API + [chatbot-ui](https://github.com/mckaywrigley/chatbot-ui) (GPT-powered app) running on a M1 Mac with local `Vicuna-7B` model. See all demos [here](https://github.com/keldenl/gpt-llama.cpp/blob/master/docs/demos.md)._

## Discord
Join our Discord Server community for the latest updates and to chat with the community (200+ members and growing): [https://discord.gg/yseR47MqpN](https://discord.gg/yseR47MqpN) 

## 🔥 Hot Topics (5/7) 🔥
- Langchain support added
- Openplayground support added
- Embeddings support added (non-llama based, higher accuracy) `EMBEDDINGS=py npm start`
- Text Completion support added
- AUTO-ADD SUPPORT FOR GPT-POWERED APPS WITH PYTHON `add-api-base.py` SCRIPT🔥🔥
- DiscGPT (full featured gpt-llama.cpp POWERED Discord BOT) open-sourced, see [repo](https://github.com/keldenl/DiscGPT)
   - Our discord server is running DiscGPT and with the bot named ELIZA

## Description

`gpt-llama.cpp` is an API wrapper around [`llama.cpp`](https://github.com/ggerganov/llama.cpp). It runs a local API server that simulates OpenAI's API GPT endpoints but uses local llama-based models to process requests.

It is designed to be a drop-in replacement for GPT-based applications, meaning that any apps created for use with GPT-3.5 or GPT-4 can work with [`llama.cpp`](https://github.com/ggerganov/llama.cpp) instead.

The purpose is to enable GPT-powered apps without relying on OpenAI's GPT endpoint and use local models, which decreases cost (free) and ensures privacy (local only).

### Supported platforms

- [x] macOS (ARM)
- [x] macOS (Intel)
- [x] Windows
- [x] Linux

## Features

`gpt-llama.cpp` provides the following features:

- Drop-in replacement for GPT-based applications
- Interactive mode supported, which means that requests within the same chat context will have blazing-fast responses
- Automatic adoption of new improvements from [`llama.cpp`](https://github.com/ggerganov/llama.cpp)
- Usage of local models for GPT-powered apps
- Support for multiple platforms

## Supported applications

The following applications (list growing) have been tested and confirmed to work with `gpt-llama.cpp` without requiring code changes:

- [chatbot-ui](https://github.com/mckaywrigley/chatbot-ui) - [setup guide](https://github.com/keldenl/gpt-llama.cpp/blob/master/docs/chatbot-ui-setup-guide.md)
- _WORKS WITH FORK:_ [Auto-GPT](https://github.com/Significant-Gravitas/Auto-GPT) - setup guide [here](https://github.com/keldenl/gpt-llama.cpp/blob/master/docs/Auto-GPT-setup-guide.md)
  - Issue tracking this [here](https://github.com/keldenl/gpt-llama.cpp/issues/2)
- ☘️ _NEW_ [langchain](https://github.com/hwchase17/langchain) - (minimal) SETUP GUIDE SOON
- [ChatGPT-Siri](https://github.com/Yue-Yang/ChatGPT-Siri) - [setup guide](https://github.com/keldenl/gpt-llama.cpp/blob/master/docs/ChatGPT-Siri-setup-guide.md)
- ☘️ _NEW_ [openplayground](https://github.com/keldenl/openplayground) - (minimal) SETUP GUIDE SOON
- ☘️ _NEW_ [DiscGPT](https://github.com/keldenl/DiscGPT) - (minimal) SETUP GUIDE SOON
- [ai-code-translator](https://github.com/mckaywrigley/ai-code-translator)
  - See issue tracking this [here](https://github.com/keldenl/gpt-llama.cpp/issues/3)

More applications are currently being tested, and welcome requests for verification or fixes by opening a new issue in the repo.

_See all demos [here](https://github.com/keldenl/gpt-llama.cpp/blob/master/docs/demos.md)._

## Quickstart Installation

🔴🔴 ⚠️ **DO NOT SKIP THE PREREQUISITE STEP** ⚠️ 🔴🔴
### Prerequisite

#### Set up `llama.cpp`
Setup [`llama.cpp`](https://github.com/ggerganov/llama.cpp) by following the instructions below. This is based on the [llama.cpp README](https://github.com/ggerganov/llama.cpp#usage). You may skip if you have `llama.cpp` set up already.

##### Mac
``` bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make

# install Python dependencies
python3 -m pip install -r requirements.txt
```

##### Windows
``` bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
```
- Then, download the latest release of llama.cpp [here](https://github.com/ggerganov/llama.cpp/releases)
I do not know if there is a simple way to tell if you should download `avx`, `avx2` or `avx512`, but oldest chip for `avx` and newest chip for `avx512`, so pick the one that you think will work with your machine. (lets try to automate this step into the future)
- Extract the contents of the zip file and copy everything in the folder (which should include `main.exe`) into your llama.cpp folder that you had just cloned. Now back to the command line

``` bash
# install Python dependencies
python3 -m pip install -r requirements.txt
```

##### Test llama.cpp
Confirm that `llama.cpp` works by running an example. Replace <YOUR_MODEL_BIN> with your llama model, typically named something like `ggml-model-q4_0.bin`
```bash
# Mac
./main -m models/7B/<YOUR_MODEL_BIN> -p "the sky is"

# Windows
main -m models/7B/<YOUR_MODEL_BIN> -p "the sky is"
```

It'll start spitting random BS, but you're golden if it's responding. You may now move on to running gpt-llama.cpp itself now.

### Running gpt-llama.cpp
#### Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/keldenl/gpt-llama.cpp.git
   cd gpt-llama.cpp
   ```

   - Strongly recommended folder structure
     ```
        documents
        ├── llama.cpp
        │   ├── models
        │   │   └── <YOUR_.BIN_MODEL_FILES_HERE>
        │   └── main
        └── gpt-llama.cpp
     ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Start the server!

   ```bash
   # Basic usage
   npm start 
   ```


You're done! Here are some more advanced configs you can run:
   ```bash
   # To run on a different port
   # Mac
   PORT=8000 npm start

   # Windows cmd
   set PORT=8000
   npm start

   # Use llama.cpp flags (use it without the "--", so instead of "--mlock" do "mlock")
   npm start mlock threads 8 ctx_size 1000 repeat_penalty 1 lora ../path/lora

   # To use sentence transformers instead of llama.cpp based embedding set EMBEDDINGS env var to "py"
   # Mac
   EMBEDDINGS=py npm start

   # Windows cmd
   set EMBEDDINGS=py
   npm start
   ```

## Usage
### Test your installation
You have 2 options:
1. Open another terminal window and test the installation by running the below script, make sure you have a llama .bin model file ready. Test the server by running the `scripts/test-installation` script (currently only supports Mac)

   ```bash
   # Mac
   sh ./test-installion.sh
   ```

2. Access the Swagger API docs at `http://localhost:443/docs` to test requests using the provided interface. Note that the authentication token needs to be set to the path of your local llama-based model (i.e. for mac, `"/Users/<YOUR_USERNAME>/Documents/llama.cpp/models/vicuna/7B/ggml-vicuna-7b-4bit-rev1.bin"`) for the requests to work properly.

![API Documentation](https://raw.githubusercontent.com/keldenl/gpt-llama.cpp/master/docs/assets/docs.png)

### Running a GPT-Powered App
There are 2 ways to set up a GPT-powered app:

1. Use a documented GPT-powered application by following [supported applications](https://github.com/keldenl/gpt-llama.cpp#Supported-applications) directions.


2. Use a undocumented GPT-powered application by checking if they support `openai.api_base`:
   - Update the `openai_api_key` slot in the gpt-powered app to the absolute path of your local llama-based model (i.e. for mac, `"/Users/<YOUR_USERNAME>/Documents/llama.cpp/models/vicuna/7B/ggml-vicuna-7b-4bit-rev1.bin"`).
   - Change the `BASE_URL` for the OpenAi endpoint the app is calling to `localhost:443` or `localhost:443/v1`. This is sometimes provided in the `.env` file, or would require manual updating within the app OpenAi calls depending on the specific application.


### Obtaining and verifying the Facebook LLaMA original model and Stanford Alpaca model data

- Under no circumstances should IPFS, magnet links, or any other links to model downloads be shared anywhere in this repository, including in issues, discussions, or pull requests. They will be immediately deleted.

- The LLaMA models are officially distributed by Facebook and will never be provided through this repository.

## Contributing

You can contribute to `gpt-llama.cpp` by creating branches and pull requests to merge. Please follow the standard process for open sourcing.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
