## 开发指南

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
npm install yarn@1.19.1 -g
yarn --cwd frontend install --ignore-engines
yarn --cwd frontend build
```

- 前后端启动

```sh
go run main.go
yarn --cwd frontend dev
```

### 提交PR

```sh
git add . # 选择所有更改
git commit -m "update: XXX"  # 提交信息
git push origin HEAD:for/dev-xxx-xxx/1 # 提交到待PR分支
```