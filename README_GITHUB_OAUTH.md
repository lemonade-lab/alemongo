# GitHub OAuth 集成说明

本文档说明如何在 alemongo 项目中配置和使用 GitHub OAuth 快捷登录和账号绑定功能。

## 配置步骤

### 1. 创建 GitHub OAuth 应用

1. 登录 GitHub，进入 [Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息：
   - **Application name**: `Alemongo`
   - **Homepage URL**: `http://ip:17187` (或你的域名)
   - **Authorization callback URL**: `http://ip:17187/login` (或你的域名 + `/login`)
4. 点击 "Register application"
5. 记录下 `Client ID` 和 `Client Secret`

### 2. 配置后端

在 `config.yaml` 文件中添加 GitHub 配置：

> 仅支持非超级管理员进行绑定

```yaml
github:
  client_id: ""
  client_secret: ""
  redirect_url: "http://ip:17187/login"
```

### 4. 重启服务

配置完成后重启 alemongo 服务以加载新配置。
