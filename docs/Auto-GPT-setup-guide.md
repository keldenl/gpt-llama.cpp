# [Auto-GPT](https://github.com/Significant-Gravitas/Auto-GPT#-installation) setup guide

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

That's it! Make sure to also run `gpt-llama.cpp` in a separate terminal/cmd window.

## Demo

Link to demo [here](https://github.com/keldenl/gpt-llama.cpp/blob/master/docs/demos.md#Auto-GPT)
