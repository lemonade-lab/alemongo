# Docker

## alemongo

下载仓库文件 [docker-compose](./docker-compose.yml)

下载仓库文件 [alemongo.conf](./alemongo.conf)

> alemongo 默认使用 `ccr.ccs.tencentyun.com`(广州腾讯云)镜像地址

> 所有包的镜像地址，可参考[/etc/docker/daemon.json](./docker-daemon.json) 

-  运行

```sh
docker compose up -d
```

- 打印

```sh
docker logs alemongo
```

- alemon.config.yaml

用`host.docker.internal`代替`localhost`/`127.0.0.1`

```yaml
# 可参考
redis:
  host: host.docker.internal
```

## onebot

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

补充 docker-compose.yml 以启动onebot

```yml
services:
  lagrange-onebot:
    build:
      context: .
      dockerfile: Dockerfile-onebot
    container_name: lagrange-onebot
    ports:
      - "8081:8081"
    volumes:
      - ./appsettings.json:/app/appsettings.json 
      - ./device.json:/app/device.json 
    restart: unless-stopped
    environment:
      - DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=true
    networks:
      - alemongo-network
```


```sh
# 查看目录
docker logs lagrange-onebot
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