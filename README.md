# 🦙 gpt-llama.cpp 
Replace GPT API with [`llama.cpp`](https://github.com/ggerganov/llama.cpp#description)'s [supported models](https://github.com/ggerganov/llama.cpp#description)

![Demo GIF](https://raw.githubusercontent.com/keldenl/gpt-llama.cpp/master/assets/demo.gif)
_Real-time speedy interaction mode demo of using `gpt-llama.cpp`'s API + [chatbot-ui](https://github.com/mckaywrigley/chatbot-ui) (GPT-powered app) running on a M1 Mac with local `Vicuna-7B` model_

## Features

`gpt-llama.cpp` provides the following features:
- Easy set up and usage
- Drop-in replacement for GPT-based applications
- Interactive mode supported, which means that requests within the same chat context will have blazing-fast responses
- Automatic adoption of new improvements from llama.cpp
- Support for multiple platforms (in progress)
- Usage of local models for GPT-powered apps

## Description

`gpt-llama.cpp` is an API wrapper around [`llama.cpp`](https://github.com/ggerganov/llama.cpp#description). It runs a local API server that simulates OpenAI's API GPT endpoints but uses local llama-based models to process requests. 

It is designed to be a drop-in replacement for GPT-based applications, meaning that any apps created for use with GPT-3.5 or GPT-4 can work with [`llama.cpp`](https://github.com/ggerganov/llama.cpp#description) instead. 

The purpose is to enable GPT-powered apps without relying on OpenAI's GPT endpoint and use local models, which decreases cost (free) and ensures privacy (local only).

### Tested platforms
- [x] macOS (ARM)
- [ ] macOS (Intel) _(untested)_
- [ ] Windows _(untested)_

## Supported applications

The following applications (list growing) have been tested and confirmed to work with `gpt-llama.cpp`:
- mckaywrigley's [chatbot-ui](https://github.com/mckaywrigley/chatbot-ui)
    - Step-by-step guide [here](#)
- Yue-Yang's [ChatGPT-Siri](https://github.com/Yue-Yang/ChatGPT-Siri)
    - Step-by-step guide [here](#)

More applications are currently being tested, and welcome requests for verification or fixes by opening a new issue in the repo.


## Quickstart

### Prerequisite
Setup llama.cpp by following the instructions in the [llama.cpp README](https://github.com/ggerganov/llama.cpp#usage).

Confirm that `llama.cpp` works by running an example `./examples/chat.sh` in the `llama.cpp` project folder. 

### Running gpt-llama.cpp
#### NPM Package
```bash
npx gpt-llama.cpp start
```
That's it!

#### Run Locally
1. Clone the repository:

   ```bash
   git clone https://github.com/keldenl/gpt-llama.cpp.git
   cd gpt-llama.cpp
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Start the server!

   ```bash
   npm start
   ```

## Usage

1. To set up the GPT-powered app, there are 2 ways:
    - To use with a documented GPT-powered application, follow [supported applications](https://github.com/keldenl/gpt-llama.cpp#Supported-applications) directions.
    - To use with a undocumented GPT-powered application, please do the following:
        - Update the `openai_api_key` slot in the gpt-powered app to the path of your local llama-based model (i.e. `"../llama.cpp/models/vicuna/7B/ggml-vicuna-7b-4bit-rev1.bin"`). 
        - Change the `BASE_URL` for the OpenAi endpoint the app is calling to `localhost:443` or `localhost:443/v1`. This is sometimes provided in the `.env` file, or would require manual updating within the app OpenAi calls depending on the specific application.

2. Access the Swagger API docs at `http://localhost:443/docs` to test requests using the provided interface. Note that the authentication token needs to be set to the path of your local llama-based model (i.e. `"../llama.cpp/models/vicuna/7B/ggml-vicuna-7b-4bit-rev1.bin"`) for the requests to work properly.

![API Documentation](https://raw.githubusercontent.com/keldenl/gpt-llama.cpp/master/assets/docs.png)


3. (Optional) Test the server by sending a request to `http://localhost:443/v1/chat/completions` with the following cURL command:

   ```bash
   curl --location --request POST 'http://localhost:443/v1/chat/completions' \
   --header 'Authorization: Bearer ../llama.cpp/models/vicuna/7B/ggml-vicuna-7b-4bit-rev1.bin' \
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
      ],
   }'
   ```

## Contributing

You can contribute to GPT-Llama.CPP by creating branches and pull requests to merge. Please follow the standard process for open sourcing. 

## License

This project is licensed under the MIT License. See the LICENSE file for more details.