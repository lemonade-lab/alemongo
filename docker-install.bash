#!/usr/bin/env bash
# alemongo docker 快捷安装/管理脚本 (Linux / macOS)
#
# 用法:
#   ./docker-install.bash up       # 启动 (缺失 docker-compose.yml / alemongo.conf 时自动拉取)
#   ./docker-install.bash down     # 停止并移除容器
#   ./docker-install.bash restart  # 重启
#   ./docker-install.bash logs     # 查看 alemongo 日志
#   ./docker-install.bash status   # 查看容器状态
#
# 环境变量:
#   ALEMONGO_RAW_BASE  自定义配置文件下载源 (默认 GitHub raw)
#   FORCE_PULL=1       强制重新下载配置文件 (覆盖本地)

set -euo pipefail

# ---------- 颜色输出 ----------
if [ -t 1 ]; then
  C_RED=$'\033[31m'; C_GRN=$'\033[32m'; C_YEL=$'\033[33m'
  C_BLU=$'\033[34m'; C_RST=$'\033[0m'
else
  C_RED=""; C_GRN=""; C_YEL=""; C_BLU=""; C_RST=""
fi
info()  { printf "%s[INFO]%s  %s\n"  "$C_BLU" "$C_RST" "$*"; }
ok()    { printf "%s[OK]%s    %s\n"  "$C_GRN" "$C_RST" "$*"; }
warn()  { printf "%s[WARN]%s  %s\n"  "$C_YEL" "$C_RST" "$*"; }
err()   { printf "%s[ERR]%s   %s\n"  "$C_RED" "$C_RST" "$*" >&2; }

# ---------- 配置 ----------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

RAW_BASE="${ALEMONGO_RAW_BASE:-https://raw.githubusercontent.com/lemonade-lab/alemongo/main}"
REQUIRED_FILES=("docker-compose.yml" "alemongo.conf")

# ---------- 环境检查 ----------
check_os() {
  local os
  os="$(uname -s)"
  case "$os" in
    Linux|Darwin) info "检测到系统: $os" ;;
    *) err "仅支持 Linux / macOS，当前: $os"; exit 1 ;;
  esac
}

check_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    err "未检测到 docker，请先安装: https://docs.docker.com/engine/install/"
    exit 1
  fi
  if ! docker info >/dev/null 2>&1; then
    err "docker 服务未运行或当前用户无权限 (可尝试 sudo 或将用户加入 docker 组)"
    exit 1
  fi
  ok "docker 已就绪: $(docker --version)"
}

# 选择 compose 命令 (优先 docker compose 插件，回退 docker-compose)
COMPOSE_CMD=""
check_compose() {
  if docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
  elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
  else
    err "未检测到 docker compose，请安装 Docker Compose v2 插件或 docker-compose"
    exit 1
  fi
  ok "compose 命令: $COMPOSE_CMD"
}

# ---------- 文件下载 ----------
download() {
  local url="$1" dest="$2"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" -o "$dest"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO "$dest" "$url"
  else
    err "需要 curl 或 wget 来下载文件"
    exit 1
  fi
}

ensure_files() {
  for f in "${REQUIRED_FILES[@]}"; do
    if [ -f "$f" ] && [ "${FORCE_PULL:-0}" != "1" ]; then
      ok "已存在: $f"
      continue
    fi
    info "下载 $f ..."
    if download "$RAW_BASE/$f" "$f.tmp"; then
      mv "$f.tmp" "$f"
      ok "已获取: $f"
    else
      rm -f "$f.tmp"
      err "下载失败: $RAW_BASE/$f"
      exit 1
    fi
  done
}

# ---------- 动作 ----------
cmd_up() {
  check_os
  check_docker
  check_compose
  ensure_files
  info "启动 alemongo (后台运行) ..."
  $COMPOSE_CMD up -d
  ok "启动完成。查看默认密码:  docker logs alemongo"
  $COMPOSE_CMD ps
}

cmd_down() {
  check_docker
  check_compose
  if [ ! -f "docker-compose.yml" ]; then
    warn "未找到 docker-compose.yml，跳过"
    exit 0
  fi
  info "停止并移除容器 ..."
  $COMPOSE_CMD down
  ok "已停止"
}

cmd_restart() {
  cmd_down || true
  cmd_up
}

cmd_logs() {
  check_docker
  docker logs -f --tail=200 alemongo
}

cmd_status() {
  check_docker
  check_compose
  $COMPOSE_CMD ps
}

usage() {
  sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'
}

main() {
  local action="${1:-}"
  case "$action" in
    up)      cmd_up ;;
    down)    cmd_down ;;
    restart) cmd_restart ;;
    logs)    cmd_logs ;;
    status|ps) cmd_status ;;
    -h|--help|help|"") usage ;;
    *) err "未知参数: $action"; usage; exit 1 ;;
  esac
}

main "$@"
