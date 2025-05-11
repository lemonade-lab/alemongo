# ALemonGO

阿柠檬WEB面板

## 安装指南

> 阅读对应操作系统的安装说明

[linux](./docs/linux.md)

[macos](./docs/maxos.md)

[windows](./docs/windows.md)

## 配置文件

> 根目录下，创建`config.yaml`文件

```yaml
# 服务器
server: 
  port: 17187 # 端口
  host: "127.0.0.1" # 仅作打印
  key: 'alemongo' # 密钥
```

> 超级临时账户会在启动时打印，直到密码更改。

## 机器人迁移

> 如果你想让alemongo管理已经独立安装的机器人

> 只需启动 alemongo 后，将机器人拖进`./work/resources`文件夹内


## 开发指南

[README_DEV](./README_DEV.md)