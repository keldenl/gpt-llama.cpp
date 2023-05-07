FROM ghcr.io/ggerganov/llama.cpp:light

RUN apt update && apt install -y curl xz-utils
RUN curl -O https://nodejs.org/dist/v18.16.0/node-v18.16.0-linux-x64.tar.xz && tar xf node-v18.16.0-linux-x64.tar.xz
RUN mv node-v18.16.0-linux-x64/bin/* /usr/bin/ && mv node-v18.16.0-linux-x64/lib/* /usr/lib/ && mv node-v18.16.0-linux-x64/include/* /usr/include/

WORKDIR /
RUN mkdir llama.cpp

WORKDIR /llama.cpp
RUN mkdir models

RUN mv /main /llama.cpp/
WORKDIR /

COPY ./ /gpt-llama.cpp
WORKDIR /gpt-llama.cpp

RUN npm install
EXPOSE 443

ENTRYPOINT ["/bin/bash", "-c"]
CMD ["npm start"]

