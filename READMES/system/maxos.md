## macOS

请选择以下方式控制 alemongo

### 选择1 通过设置后台开关

`设置` > `通用` > `登录项与扩展` > `允许在后台` > `alemongo`

### 选择2 通过指令控制服务

程序启动时会自动创建并尝试加载服务。如果自动加载失败，请手动执行以下命令：

#### 加载服务

```sh
launchctl load ~/Library/LaunchAgents/alemongo.plist
```

#### 查看服务状态

```sh
# 查看所有已加载的服务
launchctl list | grep alemongo

# 查看服务详细信息
launchctl list | grep -A 5 -B 5 alemongo
```

#### 查看服务日志

```sh
# 查看服务输出日志
tail -f ~/Library/Logs/alemongo.log

# 查看系统日志中的相关信息
log show --predicate 'process == "alemongo"' --last 1h
```

#### 卸载服务

```sh
launchctl unload ~/Library/LaunchAgents/alemongo.plist
```
