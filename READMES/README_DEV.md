## 开发指南

> debug 模式下，使用 config.dev.yaml

```sh
go run main.go debug
```

### 建立开发分支

github actoins >  开发分支 > run workflow

### 创建PR分支

```sh
git branch for/dev-XXX-XX dev-XXX-XXX/1  # 基于dev创建自己的待PR分支
git checkout for/dev-XXX-XX/1 # 切换到待PR分支
```

### 本地开发

- 前置指令

```sh
npm install yarn -g
yarn --cwd frontend install --ignore-engines
yarn --cwd frontend build
```

- 前后端启动

```sh
go run main.go dev
yarn --cwd frontend dev
```

### 数据库配置 (开发环境)

开发模式下如未设置 `db` 段落，系统将自动使用内置 sqlite (`work/data/alemongo.db`)。如需测试 MySQL/PostgreSQL：

```yaml
db:
	driver: mysql # 或 postgres
	dsn: user:pass@tcp(127.0.0.1:3306)/alemongo?charset=utf8mb4&parseTime=True&loc=Local
	auto_migrate: true
```

切回 sqlite 只需删除或注释 `db` 段落或设置 `driver: sqlite`。

### 提交PR

```sh
git add . # 选择所有更改
git commit -m "update: XXX"  # 提交信息
git push origin HEAD:for/dev-xxx-xxx/1 # 提交到待PR分支
```

### 接口文档
- 访问 `/api/v1/swagger/index.html#/`
- 注意每次更新接口/添加新接口后，需要执行`swag init`重新生成接口文档
