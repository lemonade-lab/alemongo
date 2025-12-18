# 后端构建阶段  
FROM golang:1.24 AS builder
WORKDIR /app
ENV GOPROXY=https://goproxy.cn

# 先复制 go.mod 和 go.sum 下载依赖
COPY go.mod go.sum ./
RUN go mod download

# 然后复制其他文件
COPY . .

# 打包 go 支持多架构
ARG TARGETOS=linux
ARG TARGETARCH=amd64
ARG VERSION=0.0.1
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -ldflags "-X main.Version=${VERSION} -X main.BuildTime=$(date +%s) -s -w" -o alemongo .  

# 最终运行阶段 - 轻量版 Alpine
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/alemongo .

RUN echo "https://mirrors.aliyun.com/alpine/v3.20/main" > /etc/apk/repositories && \
    echo "https://mirrors.aliyun.com/alpine/v3.20/community" >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
        nodejs \
        npm \
        chromium \
        font-noto-cjk \
        font-noto-emoji \
        openssh-client

# 设置环境变量
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROME_PATH=/usr/lib/chromium/
ENV NPM_CONFIG_CACHE=/app/.npm_cache

# 创建 SSH 已知主机和工作目录
RUN mkdir -p ~/.ssh && \
    chmod 700 ~/.ssh && \
    ssh-keyscan github.com >> ~/.ssh/known_hosts && \
    mkdir -p /app/work/data /app/work/logs

CMD ["./alemongo"]