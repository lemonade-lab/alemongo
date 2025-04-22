## macos

## 直接打开

`右键` > `打开方式` > `其他` 

选择 `启动：所有应用程序`

搜索 `终端`。选择后确认打开。

> 如果出现未知应用，打开`系统设置` > `隐私与安全性` 允许打开

### 移动应用到 `~/alemongo`

```sh
mkdir -p ~/alemongo
mv ./alemongo ~/alemongo/alemongo
```

### 创建并注册 `com.alemongo.plist`

1. 编辑文件

```sh
vi ~/Library/LaunchAgents/com.alemongo.plist
```

2. 在文件中添加以下内容：

```xml
<?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>com.alemongo</string>
       <key>ProgramArguments</key>
       <array>
           <string>~/alemongo/alemongo</string>
       </array>
       <key>RunAtLoad</key>
       <true/>
       <key>KeepAlive</key>
       <true/>
   </dict>
</plist>
```

3. 加载并启动服务：
   
```sh
launchctl load ~/Library/LaunchAgents/com.alemongo.plist
launchctl start com.alemongo
```

### 停止和卸载服务

```sh
launchctl stop com.alemongo
launchctl unload ~/Library/LaunchAgents/com.alemongo.plist
```