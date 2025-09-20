# 后端构建阶段  
FROM  golang:1.24 AS builder
WORKDIR /app
# 配置 Go 模块代理为国内镜像源
ENV GOPROXY=https://goproxy.cn
COPY dist ./dist
COPY resources ./resources
COPY src ./src
COPY docs ./docs
COPY go.mod go.sum main.go ./
# 打包 go 支持多架构
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

RUN echo "deb http://mirrors.aliyun.com/debian bookworm main contrib non-free non-free-firmware" > /etc/apt/sources.list \
  && echo "deb http://mirrors.aliyun.com/debian bookworm-updates main contrib non-free non-free-firmware" >> /etc/apt/sources.list \
  && echo "deb http://mirrors.aliyun.com/debian-security bookworm-security main contrib non-free non-free-firmware" >> /etc/apt/sources.list \
  && apt-get update \
  && apt-get install -y --fix-missing chromium fonts-noto-cjk fonts-noto-color-emoji \
  && rm -rf /var/lib/apt/lists/*  \
  && mkdir -p ~/.ssh \
  && chmod 700 ~/.ssh \
  && ssh-keyscan github.com >> ~/.ssh/known_hosts

CMD ["./alemongo"]