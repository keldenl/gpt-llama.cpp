# [ChatGPT-Siri](https://github.com/Yue-Yang/ChatGPT-Siri) setup guide

## Guide
Install `ChatGPT-Siri` based on the [official installation guide on their repo](https://github.com/Yue-Yang/ChatGPT-Siri), but with some modifications:
- Download last version of the [shortcut](https://github.com/Yue-Yang/ChatGPT-Siri#chatgpt-siri-125)

- In the shortcut modify these parameters
  - 1-use your local path to model as API_key in text box (Just before API-key definition to text box)
    - ../llama.cpp/models/vicuna/13B/ggml-vicuna-unfiltered-13b-4bit.bin
  - 2-change API-key check to not get an error:
    - I just uses API-Key must begin with / ( because my local APY key begins with /)
  - 3-Change URL link for the API
    - http://localhost:443/v1/chat/completions
  - 4-I removed the show text box with chatgpt-output variable
    5-Add a speak/tell command with chatgpt-output as parameter (in french version its "Énoncer")

-Finally then start the API with npm start in gpt-llama.cc folder

-Call siri for shortcut "name_of_your_shorcut"

That's it! Make sure to also run `gpt-llama.cpp` in a separate terminal/cmd window.

## Demo

Link to demo [here](https://github.com/keldenl/gpt-llama.cpp/blob/master/docs/demos.md#ChatGPT-Siri)
