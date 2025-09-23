## linux
 
- 启动

```sh
systemctl start alemongo
```

- 停止

```sh
systemctl stop alemongo
```

- 重启

```sh
systemctl restart  alemongo
```

- 状态

```sh
systemctl status alemongo
```

- 开机自启

```sh
systemctl enable alemongo
```

- 取消自启

```sh
systemctl disable alemongo
```

- 卸载

```sh
systemctl stop alemongo
systemctl disable alemongo
rm -rf /etc/systemd/system/alemongo.service
systemctl daemon-reload
```