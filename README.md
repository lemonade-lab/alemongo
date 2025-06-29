# ALemonGO

阿柠檬WEB面板

## 前提环境

`Git` 、 `NodeJS >= 20`

> [Linux 环境安装脚本](https://github.com/lemonade-lab/visible)

## 操作指南

[linux](./docs/linux.md)

[macos](./docs/maxos.md)

[windows](./docs/windows.md)

## 配置文件

> 根目录下，创建`config.yaml`文件
> 也可以通过参数指定`config.yaml`所在路径

```yaml
name: "alemongo"  # 项目名称
# mode: "release"   # 模式(release / debug)
host: "127.0.0.1" # 

# 服务器
server: 
  port: 17187 # 端口
  token:
    key: "alemongo"  # 密钥
    expires_time: 24 # 过期时间 (h)

# 日志
log:
  level: "info" # 日志级别 ["info", "debug", ...]
  filename: "alemongo_logs"  # 整体项目日志所在文件夹

# 邮件推送服务
smtp: 
  provider: "qq" # 使用邮箱类别
  host: "smtp.qq.com" # 服务器
  post: 587 # 端口
  username: "" # 发送方邮箱
  password: "" # 授权码
  from_email: "" # 发送方邮箱
```

- 自定义配置路径

```sh
--config ./config.test.yaml
```

> debug 模式下，使用 config.dev.yaml

> 超级临时账户会在启动时打印，直到密码更改。

## 机器人迁移

> 如果你想让alemongo管理已经独立安装的机器人

> 只需启动 alemongo 后，将机器人拖进`./work/resources`文件夹内

## Docker 

[docker-compose](./docker-compose.yml)

[alemongo.conf](./alemongo.conf)

> 默认使用`tencentyun`镜像地址

-  运行

```sh
docker compose up -d
```

- 打印

```sh
docker logs alemongo
```

## 开发指南

[README_DEV](./README_DEV.md)