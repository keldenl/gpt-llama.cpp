# gpt-llama.cpp

<p align="center">
   <img src="https://raw.githubusercontent.com/keldenl/gpt-llama.cpp/master/assets/gpt-llama.jpeg" width="250"  alt="gpt-llama.cpp logo">
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

![Demo GIF](https://raw.githubusercontent.com/keldenl/gpt-llama.cpp/master/assets/demo.gif)
_Real-time speedy interaction mode demo of using `gpt-llama.cpp`'s API + [chatbot-ui](https://github.com/mckaywrigley/chatbot-ui) (GPT-powered app) running on a M1 Mac with local `Vicuna-7B` model. See all demos [here](https://github.com/keldenl/gpt-llama.cpp/blob/master/docs/demos.md)._

### 🔥 Hot Topics (4/20/2023)

- 🔥🔥 WE MADE A DISCORD CHANNEL, JOIN HERE: [https://discord.gg/aWHBQnJaFC](https://discord.gg/aWHBQnJaFC) 🔥🔥
- ~~On-going testing for cross-platform [windows support](https://github.com/keldenl/gpt-llama.cpp/issues/6)~~ Windows should be supported now
- ~~[Auto-GPT support](https://github.com/keldenl/gpt-llama.cpp/issues/2)~~ Basic support should be complete!
- BabyAGI support

## Description

`gpt-llama.cpp` is an API wrapper around [`llama.cpp`](https://github.com/ggerganov/llama.cpp). It runs a local API server that simulates OpenAI's API GPT endpoints but uses local llama-based models to process requests.

It is designed to be a drop-in replacement for GPT-based applications, meaning that any apps created for use with GPT-3.5 or GPT-4 can work with [`llama.cpp`](https://github.com/ggerganov/llama.cpp) instead.

The purpose is to enable GPT-powered apps without relying on OpenAI's GPT endpoint and use local models, which decreases cost (free) and ensures privacy (local only).

### Tested platforms

- [x] macOS (ARM)
- [x] macOS (Intel)
- [x] Windows
- [x] Linux (Port :443 blocked by default, may have to change the port to 8000 to get working)

## Features

`gpt-llama.cpp` provides the following features:

- Drop-in replacement for GPT-based applications
- Interactive mode supported, which means that requests within the same chat context will have blazing-fast responses
- Automatic adoption of new improvements from [`llama.cpp`](https://github.com/ggerganov/llama.cpp)
- Usage of local models for GPT-powered apps
- Support for multiple platforms

## Supported applications

The following applications (list growing) have been tested and confirmed to work with `gpt-llama.cpp`:

- mckaywrigley's [chatbot-ui](https://github.com/mckaywrigley/chatbot-ui)
  - gpt-llama.cpp setup guide [here](https://github.com/keldenl/gpt-llama.cpp/blob/master/docs/chatbot-ui-setup-guide.md)
- Yue-Yang's [ChatGPT-Siri](https://github.com/Yue-Yang/ChatGPT-Siri)
  - gpt-llama.cpp setup guide [here](https://github.com/keldenl/gpt-llama.cpp/blob/master/docs/ChatGPT-Siri-setup-guide.md)
- ☘️ _WORKS WITH FORK:_ Significant-Gravitas's [Auto-GPT](https://github.com/Significant-Gravitas/Auto-GPT)
  - See issue tracking this [here](https://github.com/keldenl/gpt-llama.cpp/issues/2)
  - gpt-llama.cpp setup guide [here](https://github.com/keldenl/gpt-llama.cpp/blob/master/docs/Auto-GPT-setup-guide.md)
- ☘️ _WORKS WITH FORK:_ mckaywrigley's [ai-code-translator](https://github.com/mckaywrigley/ai-code-translator)
  - See issue tracking this [here](https://github.com/keldenl/gpt-llama.cpp/issues/3)
- yoheinakajima's [babyagi](https://github.com/yoheinakajima/babyagi)

More applications are currently being tested, and welcome requests for verification or fixes by opening a new issue in the repo.

_See all demos [here](https://github.com/keldenl/gpt-llama.cpp/blob/master/docs/demos.md)._

## Quickstart Installation

### Prerequisite

⚠️ **THIS IS REQUIRED** ⚠️

Setup [`llama.cpp`](https://github.com/ggerganov/llama.cpp) by following the instructions below. This is based on the [llama.cpp README](https://github.com/ggerganov/llama.cpp#usage).

#### Mac
``` bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make

# install Python dependencies
python3 -m pip install -r requirements.txt
```

#### Windows
🔴🔴 _WINDOWS USERS: IF YOU'RE HAVING ISSUES GETTING GPT-LLAMA.CPP OR LLAMA.CPP WORKING (MISSING MAKE.EXE FILE?), YOU CAN INSTEAD DOWNLOAD THE LATEST RELEASE AVX ZIP FROM https://github.com/ggerganov/llama.cpp/releases. EXTRACT. COPY TO \LLAMA.CPP\ FOLDER. PROFIT. THAT SHOULD WORK. YOU'RE WELCOME._ 🔴🔴

#### Test llama.cpp
Confirm that `llama.cpp` works by running an example `./examples/chat.sh` in the `llama.cpp` project folder. Once confirmed, you may now move on to 1 of the 2 below methods to get up and running.

### Running gpt-llama.cpp

#### NPM Package

```bash
# run the latest version
npx gpt-llama.cpp start

# alternatively, you can install it globally
npm i gpt-llama.cpp -g
gpt-llama.cpp start
```

That's it!

Open another terminal window and test the installation by running the below script, make sure you have a llama .bin model file ready:

   ```bash
   # Mac
   sh ./test-installation.sh
   ```

#### Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/keldenl/gpt-llama.cpp.git
   cd gpt-llama.cpp
   ```

   - Here's my suggested folder structure
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
   npm start
   ```

4. Open another terminal window and test the installation by running the below script, make sure you have a llama .bin model file ready:

   ```bash
   # Mac
   sh ./test-installation.sh
   ```

## Usage

1. To set up the GPT-powered app, there are 2 ways:

   - To use with a documented GPT-powered application, follow [supported applications](https://github.com/keldenl/gpt-llama.cpp#Supported-applications) directions.
   - To use with a undocumented GPT-powered application, please do the following:
     - Update the `openai_api_key` slot in the gpt-powered app to the absolute path of your local llama-based model (i.e. for mac, `"/Users/<YOUR_USERNAME>/Documents/llama.cpp/models/vicuna/7B/ggml-vicuna-7b-4bit-rev1.bin"`).
     - Change the `BASE_URL` for the OpenAi endpoint the app is calling to `localhost:443` or `localhost:443/v1`. This is sometimes provided in the `.env` file, or would require manual updating within the app OpenAi calls depending on the specific application.

2. Access the Swagger API docs at `http://localhost:443/docs` to test requests using the provided interface. Note that the authentication token needs to be set to the path of your local llama-based model (i.e. for mac, `"/Users/<YOUR_USERNAME>/Documents/llama.cpp/models/vicuna/7B/ggml-vicuna-7b-4bit-rev1.bin"`) for the requests to work properly.

![API Documentation](https://raw.githubusercontent.com/keldenl/gpt-llama.cpp/master/assets/docs.png)

3. (Optional) Test the server by sending a request to `http://localhost:443/v1/chat/completions` with the following cURL command:

   ```bash
   curl --location --request POST 'http://localhost:443/v1/chat/completions' \
   --header 'Authorization: Bearer <REPLACE_THIS_WITH_THE_PATH_TO_YOUR_MODEL>' \
   --header 'Content-Type: application/json' \
   --data-raw '{
      "model": "gpt-3.5-turbo",
      "messages": [
         {
            "role": "system",
            "content": "You are ChatGPT, a helpful assistant developed by OpenAI."
         },
         {
            "role": "user",
            "content": "How are you doing today?"
         }
      ]
   }'
   ```

## Contributing

You can contribute to `gpt-llama.cpp` by creating branches and pull requests to merge. Please follow the standard process for open sourcing.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
