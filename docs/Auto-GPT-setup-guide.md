# [Auto-GPT](https://github.com/Significant-Gravitas/Auto-GPT#-installation) setup guide

## Guide
For now Install `Auto-GPT` based on the [PR2594 of Auto-GPT](https://github.com/Significant-Gravitas/Auto-GPT/pull/2594/commits/b349f2144f4692de7adb9458a8888839f48bd95c)

``` bash
     git clone https://github.com/DGdev91/Auto-GPT.git
     cd Auto-GPT
     git checkout b349f2144f4692de7adb9458a8888839f48bd95c

```

Follow on with the install instruction of the `Auto-GPT` based on the [official installation guide on their repo](https://github.com/Significant-Gravitas/Auto-GPT#-installation)

install requirementsand, copy the .env.template file to .env
``` bash
    pip install --upgrade pip
    pip install -r requirements.txt
    cp .env.template .env
```
Edit .env file

OPENAI_API_BASE_URL=http://localhost:443/v1
EMBED_DIM=5120 (if using 13B llama based)
OPENAI_API_KEY= ../llama.cpp/models/vicuna/13B/ggml-vicuna-unfiltered-13b-4bit.bin

That's it! Make sure to also run `gpt-llama.cpp` in a separate terminal/cmd window.

## Demo

Link to demo [here]()
