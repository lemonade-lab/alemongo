#!/usr/bin/env bash
# alemongo docker 快捷安装/管理脚本 (Linux / macOS)
#
# 用法:
#   ./docker-install.bash up       # 启动 (缺失 docker-compose.yml / alemongo.conf 时自动拉取)
#   ./docker-install.bash down     # 停止并移除容器
#   ./docker-install.bash restart  # 重启
#   ./docker-install.bash logs     # 查看 alemongo 日志
#   ./docker-install.bash status   # 查看容器状态
#   ./docker-install.bash mirrors  # 对比本机 daemon.json 与仓库推荐镜像, 交互式差量合并
#
# 环境变量:
#   ALEMONGO_RAW_BASE  自定义配置文件下载源 (默认 GitHub raw)
#   FORCE_PULL=1       强制重新下载配置文件 (覆盖本地)
#   ASSUME_YES=1       mirrors 命令时跳过交互直接合并

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
DAEMON_REMOTE_NAME="docker-daemon.json"

# 定位本机 docker daemon.json 路径
#   Linux: /etc/docker/daemon.json
#   macOS (Docker Desktop): ~/.docker/daemon.json
local_daemon_path() {
  case "$(uname -s)" in
    Darwin) printf "%s" "$HOME/.docker/daemon.json" ;;
    Linux)  printf "%s" "/etc/docker/daemon.json" ;;
    *)      printf "" ;;
  esac
}

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

# ---------- 镜像源 (daemon.json) ----------
# 使用 sudo 条件 (Linux 下写 /etc/docker 需要 root)
_as_root() {
  if [ "$(id -u)" = "0" ]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    err "需要 root 权限写入 $1, 但未找到 sudo"
    return 1
  fi
}

_restart_docker_hint() {
  case "$(uname -s)" in
    Linux)
      info "请重启 docker 服务使配置生效:"
      info "  sudo systemctl restart docker   # systemd"
      info "  或  sudo service docker restart"
      ;;
    Darwin)
      info "请在 Docker Desktop 菜单中选择 Restart 使配置生效"
      ;;
  esac
}

cmd_mirrors() {
  check_os

  if ! command -v jq >/dev/null 2>&1; then
    err "该功能需要 jq, 请先安装: (macOS) brew install jq  /  (Debian) apt-get install -y jq"
    exit 1
  fi

  local target
  target="$(local_daemon_path)"
  if [ -z "$target" ]; then
    err "当前系统不支持自动处理 daemon.json"; exit 1
  fi
  info "本机 daemon.json 路径: $target"

  local tmp_remote
  tmp_remote="$(mktemp -t alemongo-daemon.XXXXXX)"
  trap 'rm -f "$tmp_remote"' EXIT
  info "下载仓库推荐配置: $RAW_BASE/$DAEMON_REMOTE_NAME"
  download "$RAW_BASE/$DAEMON_REMOTE_NAME" "$tmp_remote"

  # 读取远端 registry-mirrors (数组)
  local remote_mirrors
  if ! remote_mirrors="$(jq -e '."registry-mirrors" // []' "$tmp_remote" 2>/dev/null)"; then
    err "仓库 $DAEMON_REMOTE_NAME 无法解析"; exit 1
  fi

  # 读取本地 registry-mirrors
  local local_mirrors="[]"
  if [ -f "$target" ]; then
    if ! local_mirrors="$(jq -e '."registry-mirrors" // []' "$target" 2>/dev/null)"; then
      warn "本地 $target 存在但非合法 JSON, 将按空配置处理"
      local_mirrors="[]"
    fi
  else
    warn "本地 $target 不存在, 将视为空配置"
  fi

  # 差量 = 远端中不在本地的项 (保持顺序去重)
  local missing_json
  missing_json="$(jq -n --argjson r "$remote_mirrors" --argjson l "$local_mirrors" \
    '$r - $l')"
  local missing_count
  missing_count="$(printf '%s' "$missing_json" | jq 'length')"

  if [ "$missing_count" = "0" ]; then
    ok "本机 registry-mirrors 已包含仓库推荐的全部镜像源, 无需变更"
    return 0
  fi

  printf "\n%s差量镜像源 (共 %s 条, 仓库推荐但本地缺失):%s\n" "$C_YEL" "$missing_count" "$C_RST"
  printf '%s\n' "$missing_json" | jq -r '.[] | "  + " + .'
  printf "\n"

  local ans="${ASSUME_YES:-}"
  if [ -z "$ans" ] || [ "$ans" = "0" ]; then
    printf "是否将以上镜像源 %s差量追加%s 到 %s ? [y/N] " "$C_GRN" "$C_RST" "$target"
    read -r ans || ans=""
  else
    ans="y"
  fi
  case "$ans" in
    y|Y|yes|YES) ;;
    *) info "已取消"; return 0 ;;
  esac

  # 生成新 daemon.json: 以本地为基础, 追加缺失项 (本地无文件则以远端为基础)
  local tmp_out
  tmp_out="$(mktemp -t alemongo-daemon-out.XXXXXX)"
  if [ -f "$target" ]; then
    jq --argjson add "$missing_json" \
       '. as $o | $o + {"registry-mirrors": (($o["registry-mirrors"] // []) + $add)}' \
       "$target" > "$tmp_out"
  else
    # 使用仓库推荐完整配置
    cp "$tmp_remote" "$tmp_out"
  fi

  # 备份并写回
  local backup=""
  if [ -f "$target" ]; then
    backup="${target}.bak.$(date +%Y%m%d%H%M%S)"
    info "备份原文件到: $backup"
    _as_root cp -a "$target" "$backup" || { err "备份失败"; exit 1; }
  else
    # 确保目录存在
    local dir
    dir="$(dirname "$target")"
    _as_root mkdir -p "$dir" || { err "创建目录失败: $dir"; exit 1; }
  fi

  _as_root cp "$tmp_out" "$target" || { err "写入失败: $target"; exit 1; }
  rm -f "$tmp_out"
  ok "已写入: $target"
  _restart_docker_hint
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
  sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'
}

main() {
  local action="${1:-}"
  case "$action" in
    up)      cmd_up ;;
    down)    cmd_down ;;
    restart) cmd_restart ;;
    logs)    cmd_logs ;;
    status|ps) cmd_status ;;
    mirrors) cmd_mirrors ;;
    -h|--help|help|"") usage ;;
    *) err "未知参数: $action"; usage; exit 1 ;;
  esac
}

main "$@"
