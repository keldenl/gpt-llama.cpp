# [chatbot-ui](https://github.com/mckaywrigley/chatbot-ui) setup guide

## Guide
Install `chatbot-ui` based on the [official installation guide on their repo](https://github.com/mckaywrigley/chatbot-ui#running-locally), but with some modifications:

- Instead of providing the `OPENAI_API_KEY`, provide the local model path in the llama.cpp project folder. 
    - For example, for a Mac with a vicuna 7b model (this can be any other model as well), it would be something like `/Users/<YOUR_USERNAME>/Documents/llama.cpp/models/vicuna/7B/ggml-vicuna-7b-4bit-rev1.bin`.
    - Here's how your `.env.local` may look like:
        ``` bash
        # Chatbot UI
        DEFAULT_MODEL=gpt-3.5-turbo
        DEFAULT_SYSTEM_PROMPT=You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.
        OPENAI_API_KEY=../llama.cpp/models/vicuna/13B/ggml-vicuna-unfiltered-13b-4bit.bin

        # Google
        GOOGLE_API_KEY=YOUR_API_KEY
        GOOGLE_CSE_ID=YOUR_ENGINE_ID
        ```

- When running `npm run dev`, additionally set the `OPENAI_API_HOST` to localhost by running the following instead:
    ``` bash
    # Instead of this
    npm run dev

    # Run one of the following:
    # FOR MAC
    OPENAI_API_HOST=http://localhost:443 npm run dev

    # FOR WINDOWS
    # cmd
    set OPEN_API_HOST=http://localhost:443
    npm run dev
    ```

That's it! Make sure to also run `gpt-llama.cpp` in a separate terminal/cmd window. 

## Demo

Link to demo [here](https://github.com/keldenl/gpt-llama.cpp/blob/master/docs/demos.md#chatbot-ui)