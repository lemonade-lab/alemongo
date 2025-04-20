## windows

```sh
pwd
```

```sh
sc create alemongo binPath= "your path" start= auto
```

`binPath`为你的二进制文件路径。

`start= auto`设置服务为开机启动。

```sh
# 启动
sc start alemongo
```

```sh
sc stop alemongo
```

```sh
sc delete alemongo
```