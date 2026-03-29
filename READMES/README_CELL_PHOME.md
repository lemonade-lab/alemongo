# 关于手机如何安装 alemongo 进行爽玩

## 自启

1. 安装 `termux-services`：

```bash
   pkg install termux-services
```

2. 重启 Termux。

3. 创建服务脚本文件：

```
   /data/data/com.termux/files/usr/var/service/alemongo/run
```

4. 写入以下内容：

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
     -e ALEMONGO_TOKEN_KEY=your-secret-key-here \
     -e ALEMONGO_TOKEN_EXPIRES_TIME=24 \
     -v ~/.ssh:/root/.ssh \
     -v /data/data/com.termux/files/home/docker/alemongo/work:/app/work \
     ccr.ccs.tencentyun.com/ningmengchongshui/alemongo
```

5. 给权限：

```bash
   chmod +x $PREFIX/var/service/alemongo/run
```

6. 启用服务：

```bash
   sv-enable alemongo
```

7. 启动服务：

```bash
   sv up alemongo
```
