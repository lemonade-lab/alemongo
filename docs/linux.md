
## linux

```sh
mv ./alemongo /usr/local/alemongo/alemongo
```

- 创建 service

```sh
sudo vi /etc/systemd/system/alemongo.service
```

```service
[Unit]
Description=alemongo

[Service]
Type=simple
WorkingDirectory=/usr/local/alemongo/alemongo
ExecStart=/usr/local/alemongo/alemongo

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
```

- 操作

```sh
sudo systemctl start alemongo
```

```sh
sudo systemctl stop alemongo
```

```sh
sudo systemctl status alemongo
```

```sh
sudo systemctl restart alemongo
```
