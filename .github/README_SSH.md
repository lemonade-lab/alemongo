# ALemonGO

- linux

```sh
dnf install rsync -y
```

- local

```sh
# 配置
MY_IP=""
USER_NAME=""
```

```sh
# 删除旧记录
ssh-keygen -R $MY_IP
```

```sh
# 复制SSH公钥到远程服务器
ssh-copy-id $USER_NAME@$MY_IP
```

```sh
# 测试SSH连接（应该无需密码）
ssh $USER_NAME@$MY_IP
```