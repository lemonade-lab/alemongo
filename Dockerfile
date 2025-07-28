# 后端构建阶段  
FROM  golang:1.23 AS builder
WORKDIR /app

# 配置 Go 模块代理为国内镜像源
ENV GOPROXY=https://goproxy.cn

COPY dist ./dist
COPY resources ./resources
COPY src ./src
COPY go.mod go.sum main.go ./

# 打包 go，支持多架构
ARG TARGETOS
ARG TARGETARCH
ARG VERSION
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -ldflags "-X main.Version=${VERSION} -X main.BuildTime=$(date +%s) -s -w" -o alemongo .  

# 最终运行阶段
FROM  node:22
WORKDIR /app
COPY --from=builder /app/alemongo .
# 设置yarn缓存目录
ENV YARN_CACHE_FOLDER=/app/.yarn_cache
# 初始化SHH&配置国内源&&安装Chromium浏览器和字体
RUN mkdir -p ~/.ssh && chmod 700 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts && \
    sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    apt-get update && \
    apt-get install chromium -y && \
    apt-get install fonts-noto-cjk fonts-noto-color-emoji -y && \
    rm -rf /var/lib/apt/lists/*

CMD ["./alemongo"]