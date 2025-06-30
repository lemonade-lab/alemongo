# 后端构建阶段  
FROM  golang:1.23 AS builder
WORKDIR /app

# 配置 Go 模块代理为国内镜像源
ENV GOPROXY=https://goproxy.cn

COPY dist ./dist
COPY resources ./resources
COPY src ./src
COPY go.mod go.sum ./

# 打包 go，支持多架构
ARG TARGETOS
ARG TARGETARCH
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o alemongo .

# 最终运行阶段
FROM  node:22
WORKDIR /app
COPY --from=builder /app/alemongo .
# 设置yarn缓存目录
ENV YARN_CACHE_FOLDER=/app/.yarn_cache
# 初始化 ssh 目录
RUN mkdir -p ~/.ssh && chmod 700 ~/.ssh

# 安装系统依赖、Node 依赖并构建 - 合并多个 RUN
RUN echo "" > /etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/debian bookworm main contrib non-free non-free-firmware" >> /etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/debian bookworm-updates main contrib non-free non-free-firmware" >> /etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/debian-security bookworm-security main contrib non-free non-free-firmware" >> /etc/apt/sources.list && \
    apt-get update && \
    (apt-get install -y chromium || echo "Chromium not available for this architecture") && \
    rm -rf /var/lib/apt/lists/*

CMD ["./alemongo"]