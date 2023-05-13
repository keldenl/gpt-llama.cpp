# LLM Models

## ggml
Run the scripts from `./scripts/InferenceEngine/ggml-installation/<MODEL TYPE>/download-ggml-model.sh` to install models directly. If you already have your model, make sure you put it in the right folder, for example
```bash
models/ggml/gpt-2/gpt-2-117M/ggml-model.bin # gpt-2 example, must be in gpt-2 folder

# redpajama
models/ggml/gpt-neox/RedPajama-INCITE-Chat-3B-v1/ggml-model_q5_1.bin  # must be in gpt-neox folder because it's using the gpt-neox architecture under the hood
```

## llama.cpp
Still a WIP, but should live in `models/llama.cpp/<MODEL TYPE>/ggml-model.bin`