# ALemonGO

阿柠檬WEB面板

### 配置

复制 [ `.env.example`](./.env.example) 为 `.env` 并修改

```bash
# 服务器配置
ALEMONGO_SERVER_HOST=127.0.0.1
ALEMONGO_SERVER_PORT=17187

# Token 认证
ALEMONGO_TOKEN_KEY=alemongo              # 生产环境请修改
ALEMONGO_TOKEN_EXPIRES_TIME=24           # 小时

# 日志配置
ALEMONGO_LOG_LEVEL=info
ALEMONGO_LOG_FILENAME=work/logs

# 数据库配置（默认 SQLite）
ALEMONGO_DB_DRIVER=sqlite
ALEMONGO_DB_SQLITE_PATH=work/data/alemongo.db
ALEMONGO_DB_AUTO_MIGRATE=true
```

> **超级管理员**: 启动时会自动生成临时密码，修改密码后永久保存。

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

- 为指定系统安装指定版本

[README_INSTALL](./READMES/README_INSTALL.md)

## 快捷登录

[README_GITHUB_OAUTH](./READMES/README_GITHUB_OAUTH.md)

## 常见问题

[README_QUESTION](./READMES/README_QUESTION.md)

## 贡献指南

[README_DEV](./READMES/README_DEV.md)