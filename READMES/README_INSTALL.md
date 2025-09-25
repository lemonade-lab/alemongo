# 为指定系统安装指定版本

## 前提环境

`Git` 、 `NodeJS >= 20`、`Google Chrome`

> [Linux 环境安装脚本](https://github.com/lemonade-lab/visible)

## 安装

[点击releases最新版](https://github.com/lemonade-lab/alemongo/releases)

- 自定义配置路径

```sh
--config ./work/config.test.yaml
```

### 数据库

默认无需配置即使用嵌入式 sqlite (`work/data/alemongo.db`)。

使用 MySQL / PostgreSQL 需在 `config.yaml` 增加：

```yaml
db:
	driver: mysql
	dsn: user:password@tcp(127.0.0.1:3306)/alemongo?charset=utf8mb4&parseTime=True&loc=Local
	auto_migrate: true
```

或 PostgreSQL:

```yaml
db:
	driver: postgres
	dsn: host=127.0.0.1 user=alemongo password=pass dbname=alemongo port=5432 sslmode=disable TimeZone=Asia/Shanghai
	auto_migrate: true
```

注意：旧版 JSON 用户数据不再自动迁移，如需保留请手动导入。

## 操作指南

[linux](./system/linux.md)

[macos](./system/maxos.md)

[windows](./system/windows.md)
