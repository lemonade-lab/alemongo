# 为指定系统安装指定版本

## 前提环境

`Git` 、 `NodeJS >= 20`、`Google Chrome`

> [Linux 环境安装脚本](https://github.com/lemonade-lab/visible)

## 安装

[点击releases最新版](https://github.com/lemonade-lab/alemongo/releases)

### 数据库

默认无需配置即使用嵌入式 SQLite (`work/data/alemongo.db`)。

#### 使用 MySQL

通过环境变量配置：

```bash
export ALEMONGO_DB_DRIVER=mysql
export ALEMONGO_DB_DSN="user:password@tcp(127.0.0.1:3306)/alemongo?charset=utf8mb4&parseTime=True&loc=Local"
export ALEMONGO_DB_AUTO_MIGRATE=true
```

或使用 `.env` 文件：

```bash
ALEMONGO_DB_DRIVER=mysql
ALEMONGO_DB_DSN=user:password@tcp(127.0.0.1:3306)/alemongo?charset=utf8mb4&parseTime=True&loc=Local
ALEMONGO_DB_AUTO_MIGRATE=true
```

#### 使用 PostgreSQL

```bash
ALEMONGO_DB_DRIVER=postgres
ALEMONGO_DB_DSN="host=127.0.0.1 user=alemongo password=pass dbname=alemongo port=5432 sslmode=disable TimeZone=Asia/Shanghai"
ALEMONGO_DB_AUTO_MIGRATE=true
```

> **提示**: 所有配置项详见 [.env.example](../.env.example) 文件

> **注意**: 旧版 JSON 用户数据不再自动迁移，如需保留请手动导入。

## 操作指南

[linux](./system/linux.md)

[macos](./system/maxos.md)

[windows](./system/windows.md)
