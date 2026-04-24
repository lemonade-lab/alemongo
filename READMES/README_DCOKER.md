# Docker

你将了解如何快速拉取alemongo镜像，并在不重启alemongo的情况下处理端口问题

## 脚本版

适用于 Linux / macOS。脚本会自动检查 `docker` / `docker compose`，并在缺失 `docker-compose.yml`、`alemongo.conf` 时从仓库拉取。

```bash
curl -fsSL -o docker-install.bash https://raw.githubusercontent.com/lemonade-lab/alemongo/main/docker-install.bash
```

如果你想在启动前先手动检查/修改配置，也可以一次性下载所有必要文件：

```bash
BASE=https://raw.githubusercontent.com/lemonade-lab/alemongo/main
curl -fsSL -o docker-install.bash  "$BASE/docker-install.bash"
curl -fsSL -o docker-compose.yml   "$BASE/docker-compose.yml"
curl -fsSL -o alemongo.conf        "$BASE/alemongo.conf"
```

```bash
chmod +x docker-install.bash

./docker-install.bash up       # 启动（自动补全配置文件）
./docker-install.bash down     # 停止并移除容器
./docker-install.bash restart  # 重启
./docker-install.bash logs     # 跟随日志（查看默认密码）
./docker-install.bash status   # 查看容器状态
./docker-install.bash mirrors  # 对比本机 daemon.json 与仓库推荐镜像，交互式差量合并
```

可用环境变量：

```bash
# 自定义配置文件下载源（默认 GitHub raw）
ALEMONGO_RAW_BASE=https://your.mirror/lemonade-lab/alemongo/main ./docker-install.bash up

# 强制覆盖本地已有的 docker-compose.yml / alemongo.conf
FORCE_PULL=1 ./docker-install.bash up

# mirrors 命令时跳过 [y/N] 确认，直接合并
ASSUME_YES=1 ./docker-install.bash mirrors
```

## 手操版

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

- 可选的 `.env` 文件

```dotenv
# .env (按需填写，未填写的项使用 compose 默认值)
ALEMONGO_TOKEN_KEY=change-me

# ALEMONGO_GITHUB_CLIENT_ID=xxx
# ALEMONGO_GITHUB_CLIENT_SECRET=xxx
# ALEMONGO_GITHUB_REDIRECT_URL=http://localhost:17187/login

# ALEMONGO_SMTP_HOST=smtp.qq.com
# ALEMONGO_SMTP_PORT=587
# ALEMONGO_SMTP_USERNAME=
# ALEMONGO_SMTP_PASSWORD=
# ALEMONGO_SMTP_FROM_EMAIL=
```

> `env_file` 使用 `required: false`，文件缺失不会报错；需要 Docker Compose v2.24+。

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
