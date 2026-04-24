## onebot

以下内容为，在linux中，如何快速使用 onebot，

如果你在使用桌面，请参考其他pc登录方案

> 先下载 Lagrange.OneBot。具体了解 [https://lagrangedev.github.io/Lagrange.Doc](https://lagrangedev.github.io/Lagrange.Doc/v1/Lagrange.OneBot/Config/)

> 下载后，把 `Lagrange.OneBot` 放在同级目录

新增 Dockerfile-onebot 以打包进docker

```sh
FROM ubuntu:22.04
WORKDIR /app
RUN apt-get update && \
    apt-get install -y \
    ca-certificates \
    curl \
    wget \
    libicu70 \
    && rm -rf /var/lib/apt/lists/*
COPY ./Lagrange.OneBot .
RUN chmod +x ./Lagrange.OneBot
CMD ["./Lagrange.OneBot"]
```

补充 `docker-compose.yml` 以启动onebot

```yml
services:
  onebot:
    build:
      context: .
      dockerfile: Dockerfile-onebot
    container_name: onebot
    volumes:
      - ./appsettings.json:/app/appsettings.json 
      - ./device.json:/app/device.json 
    restart: unless-stopped
    environment:
      - DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=true
    networks:
      - alemongo-network
    depends_on:
      - alemongo

```

还补充 `alemongo.conf` 以转发 onebot，同时调整nginx

```sh
# 查看目录
docker logs onebot
```

> 自建/自动生成的`appsettings.json`文件需要补充下面的内容

> Implementations，新增type为`ForwardWebSocket`,Host`0.0.0.1`,port`8081`的配置

```sh
{
    "Implementations": [
        {
            "Type": "ForwardWebSocket",
            "Host": "0.0.0.0",
            "Port": 8081,
            "HeartBeatInterval": 5000,
            "HeartBeatEnable": true,
            "AccessToken": ""
        }
    ]
}
```