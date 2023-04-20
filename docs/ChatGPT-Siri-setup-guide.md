# [ChatGPT-Siri](https://github.com/Yue-Yang/ChatGPT-Siri) setup guide

## Guide
@keldenl made a `ChatGPT-Siri` fork based on the [original 1.2.5 shortcut version](https://github.com/Yue-Yang/ChatGPT-Siri)

⭐ **Download the iOS shortcut [here](https://www.icloud.com/shortcuts/c50e0007261141be9bedbf99c976225c)**


In the shortcut follow the setup instructions:

1. **Paste the IP address and Port for gpt-llama.cpp (i.e. 192.168.0.69:443). It is displayed when you start the gpt-llama.cpp server.**
  - To get this, run gpt-llama.cpp (`gpt-llama.cpp start`, or `npm start`, however you set it up earlier). You should see something like this in your terminal:
    ```bash
      gpt-llama.cpp % npm run dev

      > gpt-llama.cpp@0.1.9 dev
      > nodemon index.js

      [nodemon] 2.0.22
      [nodemon] to restart at any time, enter `rs`
      [nodemon] watching path(s): *.*
      [nodemon] watching extensions: js,mjs,json
      [nodemon] starting `node index.js`
      Server is listening on:
        - localhost:443
        - 192.168.0.11:443 (for other devices on the same network)
    ```
  - Answer by copying & pasting your IP (last line) AND port, in this case it would be `192.168.0.11:443`

2. **Paste the absolute or relative (to gpt-llama.cpp folder) path to your llama.cpp model .bin file**
  - Example relative path: `../llama.cpp/models/vicuna/13B/ggml-vicuna-unfiltered-13b-4bit.bin`
  - Example absolute path: `C:/Users/bob/Desktop/llama.cpp/models/13b/ggml-vicuna-13b-4bit-rev1.bin`

3. **Start gpt-llama.cpp with `npm start` in `gpt-llama.cpp` folder or however else you're running it**

4. **Done! Call Siri for shortcut via...**
  - Hands-free: say "Hey Siri, Quick Question"
  - Hands-on: *hold down power/home button, siri pops up* -> say "Quick question"
  - Voice-less: Add the shortcut to homepage or tap on it in the shortcuts apps

That's it! Make sure that `gpt-llama.cpp` is always running on a separate terminal/cmd window while doing this, or else it won't work.

## Demo

Link to demo [here](https://github.com/keldenl/gpt-llama.cpp/blob/master/docs/demos.md#ChatGPT-Siri)
