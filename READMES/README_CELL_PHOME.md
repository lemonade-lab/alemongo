# 关于手机如何进行爽玩alemongo

## 前置准备

### 1. 安装 Termux

从  https://f-droid.org/packages/com.termux/ 下载安装 Termux（不要用 Play Store 版本，已过时）。

打开 Termux 后，先更新软件包：

```bash
pkg update && pkg upgrade
```

### 2. 安装 udocker

udocker 是一个无需 root 权限的轻量级容器工具，用来在手机上运行 alemongo 镜像。

> 如果没有 pip，先安装 Python

```bash
pkg install python-pip`
```

```bash
pip install udocker
```

安装完成后拉取镜像：

```bash
udocker pull ccr.ccs.tencentyun.com/ningmengchongshui/alemongo
```

### 3. 创建数据目录

```bash
mkdir -p ~/docker/alemongo/work
```

---

## 配置开机自启服务

### 1. 安装 termux-services

```bash
pkg install termux-services
```

安装完成后 **完全关闭 Termux 再重新打开**（从后台划掉），让服务框架生效。

### 2. 创建服务目录

```bash
mkdir -p $PREFIX/var/service/alemongo
```

### 3. 创建服务脚本

用编辑器创建启动脚本：

```bash
nano $PREFIX/var/service/alemongo/run
```

粘贴以下内容（长按屏幕 → 粘贴）：

```bash
#!/data/data/com.termux/files/usr/bin/sh

udocker run \
  -e TZ=Asia/Shanghai \
  -e ALEMONGO_USE_ENV=true \
  -e ALEMONGO_SERVER_HOST=0.0.0.0 \
  -e ALEMONGO_SERVER_PORT=17187 \
  -e ALEMONGO_MODE=release \
  -e ALEMONGO_DB_DRIVER=sqlite \
  -e ALEMONGO_DB_SQLITE_PATH=/app/work/data/alemongo.db \
  -e ALEMONGO_TOKEN_KEY=alemongo-key \
  -e ALEMONGO_TOKEN_EXPIRES_TIME=24 \
  -v ~/.ssh:/root/.ssh \
  -v /data/data/com.termux/files/home/docker/alemongo/work:/app/work \
  ccr.ccs.tencentyun.com/ningmengchongshui/alemongo
```

> **重要：** 请把 `ALEMONGO_TOKEN_KEY` 的值改成你自己的随机字符串，这是用于登录令牌加密的密钥，不要用默认值。

保存并退出 nano：按 `Ctrl+X`，然后按 `Y`，再按 `回车`。

### 4. 给脚本添加执行权限

```bash
chmod +x $PREFIX/var/service/alemongo/run
```

### 5. 启用并启动服务

```bash
sv-enable alemongo
sv up alemongo
```

---

## 访问面板

服务启动后，在手机浏览器中打开：

```
http://127.0.0.1:17187
```

如果想从同一局域网下的其他设备（如电脑）访问，先查看手机 IP：

```bash
ifconfig
```

然后在其他设备浏览器输入 `http://手机IP:17187`。

> 首次启动会自动生成超级管理员的临时密码，请查看日志获取。

---

## 常用操作

| 操作 | 命令 |
|------|------|
| 启动服务 | `sv up alemongo` |
| 停止服务 | `sv down alemongo` |
| 查看服务状态 | `sv status alemongo` |
| 禁用自启 | `sv-disable alemongo` |

---

## 常见问题

**Q: 提示找不到 udocker 命令？**

确认 Python 和 pip 已安装：`pkg install python-pip && pip install udocker`

**Q: 端口被占用怎么办？**

修改脚本中 `ALEMONGO_SERVER_PORT` 的值为其他端口（如 18080），然后重启服务：

```bash
sv down alemongo && sv up alemongo
```

**Q: 怎么查看运行日志？**

日志存放在数据目录中：

```bash
ls ~/docker/alemongo/work/logs/
```
