# ALemonGO

alemonjs 框架，机器人管理端

你可以使用web轻松部署并控制多个机器人

## 安装指南

> 阅读对应操作系统的安装说明

[linux](./docs/linux.md)

[macos](./docs/maxos.md)

[windows](./docs/windows.md)

## 配置文件

> 根目录下，创建`config.yaml`文件

```yaml
# 服务器
server: 
  port: 17187 # 端口
  host: "localhost" # 仅作打印
  key: 'alemongo' # 密钥

# 用户
users: 
   - identity: "admin" # 管理员
     username: "lemonade"  # 用户名
     password: "123456"  # 密码

   - identity: "master" # 主账户
     mastername: "lemonade"
     username: "ningmengchongshui"
     password: "123456"

   - identity: "sub" # 子账户
     mastername: "ningmengchongshui"
     username: "sub_1"
     password: "123456"

   - identity: "tourist" # 游客（API数据为*，仅展示UI和UE）
     mastername: "ningmengchongshui"
     username: "tourist_acount"
     password: "123456"
```

## 机器人迁移

> 如果你想让alemongo管理已经独立安装的机器人

> 只需启动 alemongo 后，将机器人拖进`./work/resources`文件夹内
