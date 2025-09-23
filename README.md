# ALemonGO

阿柠檬WEB面板

## 配置文件

> 根目录下，创建`./work/config.yaml`文件 (默认)

```yaml
name: "alemongo"  # 项目名称
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
```

> 超级管理(临时密码)会在启动时打印，直到密码更改。

- 工作目录

默认工作目录为`work`,包含运行的所有信息和文件

> 如果你想让alemongo管理已经独立安装的机器人

> 只需启动 alemongo 后，将机器人拖进`./work/resources/bots`文件夹内

- 最新模板 package.json

[package.json](./resources/template/package.json)

## 部署

- docker

> 推荐使用 docker 进行快速部署

[README_DCOKER](./READMES/README_DCOKER.md)

- system

[README_DCOKER](./READMES/README_INSTALL.md)

## 快捷登录

[README_GITHUB_OAUTH](./READMES/README_GITHUB_OAUTH.md)

## 常见问题

[README_QUESTION](./READMES/README_QUESTION.md)

## 贡献指南

[README_DEV](./READMES/README_DEV.md)