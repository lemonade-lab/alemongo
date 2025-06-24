# 前端构建阶段
FROM node:22 AS bundle
WORKDIR /app
COPY frontend ./frontend
RUN yarn --cwd frontend install
RUN yarn --cwd frontend build

# 后端构建阶段
FROM golang:1.23 AS builder
WORKDIR /app
COPY . .
# 获得dist
COPY --from=bundle /app/dist ./dist
# 打包 go
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o alemongo .

# 最终运行阶段
FROM node:22
WORKDIR /app
COPY --from=builder /app/alemongo .
# 设置yarn缓存目录
ENV YARN_CACHE_FOLDER=/app/.yarn_cache
# 初始化 ssh 目录
RUN mkdir -p ~/.ssh && chmod 700 ~/.ssh
# 清空
RUN echo "" > /etc/apt/sources.list
# 追加
RUN echo "deb http://mirrors.aliyun.com/debian bookworm main contrib non-free non-free-firmware" >> /etc/apt/sources.list
# 追加更新源
RUN echo "deb http://mirrors.aliyun.com/debian bookworm-updates main contrib non-free non-free-firmware" >> /etc/apt/sources.list
# 追加安全更新源
RUN echo "deb http://mirrors.aliyun.com/debian-security bookworm-security main contrib non-free non-free-firmware" >> /etc/apt/sources.list
# 安装 chromium
RUN apt-get update \
    && apt-get install -y chromium \
    && rm -rf /var/lib/apt/lists/*
# 启动
CMD ["./alemongo"]