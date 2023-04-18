# [chatbot-ui](https://github.com/mckaywrigley/chatbot-ui) setup guide

## Guide
Install `chatbot-ui` based on the [official installation guide on their repo](https://github.com/mckaywrigley/chatbot-ui#running-locally), but with some modifications:

- Instead of providing the `OPENAI_API_KEY`, provide the local model path in the llama.cpp project folder. 
    - For example, for a Mac with a vicuna 7b model, it would be something like `"/Users/<YOUR_USERNAME>/Documents/llama.cpp/models/vicuna/7B/ggml-vicuna-7b-4bit-rev1.bin"`.
- When running `npm run dev`, set the `OPENAI_API_HOST` to localhost by running the following instead:
    ``` bash
    OPENAI_API_HOST=http://localhost:443 npm run dev
    ```

That's it!

## Demo

Link to demo [here](https://github.com/keldenl/gpt-llama.cpp/blob/master/docs/demos.md#chatbot-ui)