# Docker

你将了解如何快速拉取alemongo镜像，并在不重启alemongo的情况下处理端口问题

## alemongo

下载仓库文件 [docker-compose](../docker-compose.yml)

下载仓库文件 [alemongo.conf](../alemongo.conf)

> alemongo 默认使用 `ccr.ccs.tencentyun.com`(广州腾讯云)镜像地址

> 推荐配置镜像，可参考[/etc/docker/daemon.json](../docker-daemon.json) 

-  运行

下载文件后，后台运行 compose

```sh
docker compose up -d
```

- 打印

打印信息来查看默认密码

```sh
docker logs alemongo
```

- alemon.config.yaml

在alemongo连接外部localhost时，

请用`host.docker.internal`代替`localhost`/`127.0.0.1`

```yaml
# 可参考 redis 连接
redis:
  host: host.docker.internal
```

- 调整端口

配置默认开放 18187、17117这2个默认端口，

如把 17117 暴露改为 17118，

需要同时修改，或新增 docker-compose.yml 和 alemongo.conf 的端口号

基本原理为，nginx 代理 alemongo。调整nginx配置并重启nginx。

```sh
# 仅删除 nginx
docker compose rm -sf nginx
```

```sh
# 仅启动 nginx
docker compose up -d nginx
```

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