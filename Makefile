.PHONY: help build run dev test clean install deps lint format swagger docker-build docker-run

# 默认目标
.DEFAULT_GOAL := help

# 帮助信息
help: ## 显示帮助信息
	@echo "ALemonGO 可用命令:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# 开发相关命令
dev: ## 启动开发模式
	@echo "启动开发模式..."
	go run main.go debug

run: ## 启动生产模式
	@echo "启动生产模式..."
	go run main.go

test: ## 运行测试
	@echo "运行测试..."
	go test ./...

build: ## 构建项目
	@echo "构建项目..."
	go build -o alemongo main.go

install: ## 安装依赖
	@echo "安装Go依赖..."
	go mod tidy
	go mod download

# 前端相关命令
feinstall: ## 安装前端依赖
	@echo "安装前端依赖..."
	cd frontend && yarn install --ignore-engines

febuild: ## 构建前端
	@echo "构建前端..."
	cd frontend && yarn build

fedev: ## 启动前端开发服务器
	@echo "启动前端开发服务器..."
	cd frontend && yarn dev

# 代码质量
lint: ## 运行代码检查
	@echo "运行代码检查..."
	golangci-lint run

format: ## 格式化代码
	@echo "格式化代码..."
	go fmt ./...
	goimports -w .

# 文档生成
swagger: ## 生成Swagger文档
	@echo "生成Swagger文档..."
	swag init

# Docker相关
docker-build: ## 构建Docker镜像
	@echo "构建Docker镜像..."
	docker build -t alemongo .

docker-run: ## 运行Docker容器
	@echo "运行Docker容器..."
	docker run -p 17187:17187 alemongo

# 清理
clean: ## 清理构建文件
	@echo "清理构建文件..."
	go clean
	rm -f alemongo
	cd frontend && rm -rf dist

# 数据库相关
db-start: ## 启动数据库
	@echo "启动数据库..."
	cd resources/db && docker-compose up -d

db-stop: ## 停止数据库
	@echo "停止数据库..."
	cd resources/db && docker-compose down

# 服务管理
service-install: ## 安装系统服务
	@echo "安装系统服务..."
	sudo systemctl enable alemongo

service-start: ## 启动系统服务
	@echo "启动系统服务..."
	sudo systemctl start alemongo

service-stop: ## 停止系统服务
	@echo "停止系统服务..."
	sudo systemctl stop alemongo

service-status: ## 查看系统服务状态
	@echo "查看系统服务状态..."
	sudo systemctl status alemongo

# 日志相关
logs: ## 查看应用日志
	@echo "查看应用日志..."
	tail -f alemongo_logs/$(shell date +%Y-%m-%d).log

# 配置相关
config-example: ## 复制配置示例文件
	@echo "复制配置示例文件..."
	cp config.example.yaml work/config.yaml

# 性能分析
profile-cpu: ## CPU性能分析
	@echo "CPU性能分析..."
	go test -cpuprofile=cpu.prof -v ./...
	go tool pprof -http=:8080 cpu.prof

profile-mem: ## 内存性能分析
	@echo "内存性能分析..."
	go test -memprofile=mem.prof -v ./...
	go tool pprof -http=:8081 mem.prof

profile-trace: ## 执行跟踪分析
	@echo "执行跟踪分析..."
	go test -trace=trace.out -v ./...
	go tool trace trace.out

# 测试覆盖率
coverage: ## 生成测试覆盖率报告
	@echo "生成测试覆盖率报告..."
	go test -v -race -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "覆盖率报告已生成: coverage.html"

coverage-func: ## 显示函数级别的覆盖率
	@echo "函数级别覆盖率:"
	go tool cover -func=coverage.out

# 基准测试
benchmark: ## 运行基准测试
	@echo "运行基准测试..."
	go test -bench=. -benchmem -v ./...

benchmark-cpu: ## CPU基准测试
	@echo "CPU基准测试..."
	go test -bench=. -benchmem -cpuprofile=cpu.prof -v ./...

benchmark-mem: ## 内存基准测试
	@echo "内存基准测试..."
	go test -bench=. -benchmem -memprofile=mem.prof -v ./...

# 清理调试文件
clean-debug: ## 清理调试文件
	@echo "清理调试文件..."
	rm -f coverage.out coverage.html
	rm -f *.prof trace.out
	rm -f *.test

# 版本信息
version: ## 显示版本信息
	@echo "ALemonGO 版本信息:"
	@echo "Go版本: $(shell go version)"
	@echo "项目版本: $(shell grep 'var Version' main.go | cut -d'"' -f2)"
