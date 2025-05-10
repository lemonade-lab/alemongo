## macos

请选择以下方式控制 alemongo

### 选择1 通过设置后台开关

`设置` > `通用` > `登录项与扩展` > `允许在后台` > `alemongo`

### 选择2 通过指令控制服务

- 加载

```sh
load ~/Library/LaunchAgents/alemongo.plist
```

- 查看

```sh
launchctl list | grep alemongo
```

- 卸载

```sh
launchctl unload ~/Library/LaunchAgents/alemongo.plist
```