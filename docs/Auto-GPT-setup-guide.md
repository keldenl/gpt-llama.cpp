# [Auto-GPT](https://github.com/Significant-Gravitas/Auto-GPT#-installation) setup guide

## Prerequisite
PLEASE make sure that `gpt-llama.cpp` is installed and running already! See https://github.com/keldenl/gpt-llama.cpp#quickstart-installation if you haven't yet or don't know what I just referred to.

## Guide
~~Follow on with the install instruction of the `Auto-GPT` based on the [official installation guide on their repo](https://github.com/Significant-Gravitas/Auto-GPT#-installation)~~
NOTE: For now, install `Auto-GPT` based on the DGdev91's [PR #2594](https://github.com/Significant-Gravitas/Auto-GPT/pull/2594). You can do this by:

``` bash
     git clone https://github.com/DGdev91/Auto-GPT.git # clone DGdev91's fork
     cd Auto-GPT
     git checkout b349f2144f4692de7adb9458a8888839f48bd95c # checkout the PR change
```

1. Install requirements and, copy the .env.template file to .env
    ``` bash
        pip install --upgrade pip
        pip install -r requirements.txt
        cp .env.template .env
    ```
2. Edit .env file (Find proper EMBED_DIM for llama model [here](https://huggingface.co/shalomma/llama-7b-embeddings#quantitative-analysis), tl;dr - 7B = 4096 & 13B = 5120)
    ``` bash
        OPENAI_API_BASE_URL=http://localhost:443/v1
        EMBED_DIM=5120
        OPENAI_API_KEY= ../llama.cpp/models/vicuna/13B/ggml-vicuna-unfiltered-13b-4bit.bin
    ```

3. Run Auto-GPT
    ```bash
        # On Linux or Mac:
        ./run.sh start
        # On Windows:
        .\run.bat

        # or with python
        python -m autogpt
    ```

Make sure to also run `gpt-llama.cpp` in a separate terminal/cmd window. 

### EMBEDDING IMPROVEMENTS
You may also want to run the sentence transformers extension for `gpt-llama.cpp` instead of relying on `llama.cpp`-based embeddings (I've seen it fail on huge inputs). It's the recommended way to do this and here's how to set it up and do it:

```bash
# Make sure you npm install, which triggers the pip/python requirements.txt installation
npm install 

# Note that first time running an embedding may require installation of the sentence transformer. 
# So it may take a while

# To use sentence transformers instead of llama.cpp based embedding set EMBEDDINGS env var to "py"
# Mac
EMBEDDINGS=py npm start

# Windows cmd
set EMBEDDINGS=py
npm start
```

## Demo

Link to demo [here](https://github.com/keldenl/gpt-llama.cpp/blob/master/docs/demos.md#Auto-GPT)
