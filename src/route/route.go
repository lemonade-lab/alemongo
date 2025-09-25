package route

import (
	_ "alemongo/docs"
	"alemongo/src/apps/api/bot"
	botconfig "alemongo/src/apps/api/bot/config"
	botconfigs "alemongo/src/apps/api/bot/configs"
	apiconfig "alemongo/src/apps/api/config"
	apiemail "alemongo/src/apps/api/email"
	"alemongo/src/apps/api/multibots"
	"alemongo/src/apps/api/portMonitor"
	sftp "alemongo/src/apps/api/sftp"
	apisystem "alemongo/src/apps/api/system"
	"alemongo/src/apps/api/terminal"

	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	botenv "alemongo/src/apps/api/bot/env"
	botpackage "alemongo/src/apps/api/bot/package"
	botpackages "alemongo/src/apps/api/bot/packages"
	botwarehouse "alemongo/src/apps/api/bot/warehouse"

	"alemongo/src/apps/api/common"
	"alemongo/src/apps/api/gitssh"
	"alemongo/src/apps/api/notification"
	"alemongo/src/apps/api/receive"
	"alemongo/src/apps/api/settings"
	"alemongo/src/apps/api/user"
	"alemongo/src/logger"
	"alemongo/src/middlewares"
	"alemongo/src/permission"

	"github.com/gin-gonic/gin"
)

// 路由初始化
func Use(r *gin.Engine) *gin.Engine {
	// 添加跨域请求中间件
	r.Use(middlewares.CorsMiddleware())
	// 添加自定义日志中间件
	r.Use(logger.GinLogger(), logger.GinRecovery(true))
	return r
}

// get 使用 query 参数，
// post 使用 form 参数，
// put 使用 form 参数，
// delete 使用 form 参数
func Create(mode string) *gin.Engine {
	// 根据 mode 设置 发布模式/开发模式

	switch mode {
	case gin.DebugMode:
		gin.SetMode(gin.DebugMode)
	case gin.TestMode:
		gin.SetMode(gin.TestMode)
	default:
		gin.SetMode(gin.ReleaseMode)
	}

	// 创建路由
	r := gin.Default()
	// 实例化app
	app := Use(r)
	// 接口api
	api := app.Group("/api")
	{
		// 接口 v
		v1 := api.Group("/v1")
		{
			v1.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))
			// 公共接口
			CommonAPI := v1.Group("/common")
			{
				CommonAPI.POST("/receive", receive.POST) // 推送github事件
				// 一般配置（无需登录）
				CommonAPI.GET("/config", common.GetGeneralConfig) // 获取一般配置
				// 开始鉴权
				CommonAPI.Use(middlewares.AuthMiddleware())
				CommonAPI.GET("/info", common.Info)                                                                             // 获取环境信息（需要权限）
				CommonAPI.GET("/monitor", middlewares.PermissionMiddleware(permission.SystemConfigRead), common.GetSystemStats) // 获取系统监控信息（需要权限）
			}

			// system
			SystemAPI := v1.Group("/system")
			{
				// WebSocket 日志流 (使用 subprotocol 鉴权)
				SystemAPI.GET("/log/ws", apisystem.SystemLogWS)
				// 开始鉴权
				SystemAPI.Use(middlewares.AuthMiddleware())
				// 系统日志
				SystemAPI.POST("/log", middlewares.PermissionMiddleware(permission.SystemConfigRead), apisystem.Log)
				SystemAPI.POST("/log-online", middlewares.PermissionMiddleware(permission.SystemConfigRead), apisystem.LogOnline)
				SystemAPI.GET("/log/download", middlewares.PermissionMiddleware(permission.SystemConfigRead), apisystem.LogDownload)
				// 仅查看：检测依赖
				SystemAPI.GET("/deps/check", middlewares.PermissionMiddleware(permission.SystemConfigRead), apisystem.CheckDependencies)
				// 生成安装计划（默认仅预览，不执行）
				SystemAPI.POST("/deps/install", middlewares.PermissionMiddleware(permission.SystemSettingsManage), apisystem.PlanInstall)
				// 防火墙：状态与计划
				SystemAPI.GET("/firewall/status", middlewares.PermissionMiddleware(permission.SystemConfigRead), apisystem.GetFirewallStatus)
				SystemAPI.POST("/firewall/plan", middlewares.PermissionMiddleware(permission.SystemSettingsManage), apisystem.PlanFirewall)
				// 任务中心：查看
				SystemAPI.GET("/tasks", middlewares.PermissionMiddleware(permission.SystemConfigRead), apisystem.ListTasks)
				SystemAPI.GET("/tasks/:id", middlewares.PermissionMiddleware(permission.SystemConfigRead), apisystem.GetTask)
				// 任务中心：控制
				SystemAPI.POST("/tasks/:id/cancel", middlewares.PermissionMiddleware(permission.SystemSettingsManage), apisystem.CancelTask)
			}
			// settings
			SettingsAPI := v1.Group("/settings")
			{
				// 开始鉴权
				SettingsAPI.Use(middlewares.AuthMiddleware())
				// 系统设置管理接口
				SettingsAPI.GET("/powerboot", middlewares.PermissionMiddleware(permission.SystemSettingsManage), settings.PowerBoot)             // 开机自启设置
				SettingsAPI.GET("/powerboot/status", middlewares.PermissionMiddleware(permission.SystemConfigRead), settings.GetAutoStartStatus) // 获取开机自启状态
				SettingsAPI.POST("/template/reset", middlewares.PermissionMiddleware(permission.SystemSettingsManage), settings.ResetTemplate)   // 重置基础机器人模板
			}

			// config api
			ConfigAPI := v1.Group("/config")
			{
				// 开始鉴权
				ConfigAPI.Use(middlewares.AuthMiddleware())
				// 邮箱配置管理
				EmailAPI := ConfigAPI.Group("/email")
				{
					EmailAPI.GET("", middlewares.PermissionMiddleware(permission.SystemConfigRead), apiemail.GetEmail)      // 获取邮箱配置
					EmailAPI.PUT("", middlewares.PermissionMiddleware(permission.SystemConfigUpdate), apiemail.UpdateEmail) // 更新邮箱配置
				}

				// GitHub配置管理
				GitHubAPI := ConfigAPI.Group("/github")
				{
					GitHubAPI.GET("", middlewares.PermissionMiddleware(permission.SystemConfigRead), apiconfig.GetGitHubConfig)      // 获取GitHub配置
					GitHubAPI.PUT("", middlewares.PermissionMiddleware(permission.SystemConfigUpdate), apiconfig.UpdateGitHubConfig) // 更新GitHub配置
					GitHubAPI.GET("/status", apiconfig.GetGitHubConfigStatus)                                                        // 获取GitHub配置状态（无需权限）
				}
			}

			// user api
			UserAPI := v1.Group("/user")
			{
				// 无需权限的接口
				UserAPI.POST("/login", user.Login)                               // 登录
				UserAPI.GET("/github/auth-url", user.GetGitHubAuthURL)           // 获取 GitHub 授权 URL
				UserAPI.GET("/github/config-status", user.GetGitHubConfigStatus) // 获取 GitHub 配置状态
				UserAPI.POST("/github/login", user.GitHubLogin)                  // GitHub 快捷登录

				// 需要认证的接口
				UserAPI.Use(middlewares.AuthMiddleware())                // 开始鉴权
				UserAPI.POST("/github/unbind", user.UnbindGitHubAccount) // GitHub 解绑（需要认证）
				UserAPI.POST("/github/bind", user.BindGitHubAccount)     // GitHub 绑定（需要认证）
				UserAPI.GET("/logout", user.Logout)                      // 退出登录
				UserAPI.GET("/info", user.Info)                          // 获取用户信息
				UserAPI.PUT("/password", user.PassWord)                  // 修改密码
				UserAPI.POST("/bind_email", user.BindEmailHandler)       // 绑定邮箱
				UserAPI.POST("/verify_email", user.VerifyEmailHandler)   // 验证邮箱

				// 需要用户管理权限的接口
				UserAPI.GET("/list", middlewares.PermissionMiddleware(permission.UserRead), user.List)                   // 用户列表
				UserAPI.GET("/identity/list", middlewares.PermissionMiddleware(permission.UserRead), user.IdentityList)  // 身份列表
				UserAPI.PUT("/identity", middlewares.PermissionMiddleware(permission.UserUpdate), user.Identity)         // 修改身份
				UserAPI.GET("/admin-status", middlewares.PermissionMiddleware(permission.UserRead), user.GetAdminStatus) // 获取超级管理员状态

				// 仅超级管理员可访问的接口
				UserAPI.POST("/create", middlewares.PermissionMiddleware(permission.UserCreate), user.CreateUserHandler)   // 创建用户
				UserAPI.DELETE("/delete", middlewares.PermissionMiddleware(permission.UserDelete), user.DeleteUserHandler) // 删除用户
			}
			// notifications
			NotificationAPI := v1.Group("/notifications")
			{
				// WebSocket 实时通知 (使用 subprotocol 鉴权) —— 放在 HTTP AuthMiddleware 之前，避免要求 Authorization 头
				NotificationAPI.GET("/ws", notification.NotificationWS)
				// 剩余 HTTP 接口需要 Bearer 认证
				NotificationAPI.Use(middlewares.AuthMiddleware())
				NotificationAPI.GET("", notification.ListNotifications) // ?status=&page=&page_size=
				NotificationAPI.GET("/unread-count", notification.UnreadCount)
				NotificationAPI.POST("/create", middlewares.PermissionMiddleware(permission.SystemSettingsManage), notification.CreateNotification)
				NotificationAPI.PATCH(":id/read", notification.MarkRead)
				NotificationAPI.PATCH("/read-all", notification.MarkAllRead)
				NotificationAPI.DELETE("/:id", notification.DeleteNotification)
			}
			// ssh
			SSHAPI := v1.Group("/ssh")
			{
				// 开始鉴权
				SSHAPI.Use(middlewares.AuthMiddleware())
				// SSH密钥管理接口
				SSHAPI.GET("/list", middlewares.PermissionMiddleware(permission.SSHRead), gitssh.List)              // SSH密钥列表
				SSHAPI.GET("", middlewares.PermissionMiddleware(permission.SSHRead), gitssh.Read)                   // 读取SSH密钥
				SSHAPI.POST("", middlewares.PermissionMiddleware(permission.SSHCreate), gitssh.GenerateSSH)         // 创建SSH密钥
				SSHAPI.PUT("", middlewares.PermissionMiddleware(permission.SSHUpdate), gitssh.Update)               // 更新SSH密钥
				SSHAPI.DELETE("", middlewares.PermissionMiddleware(permission.SSHDelete), gitssh.Delete)            // 删除SSH密钥
				SSHAPI.POST("/authorize", middlewares.PermissionMiddleware(permission.SSHUpdate), gitssh.Authorize) // SSH授权
			}
			// bot
			BotAPI := v1.Group("/bot")
			{
				// WebSocket 日志流 (使用 subprotocol 鉴权)
				BotAPI.GET("/log/ws", apisystem.BotLogWS)
				// 开始鉴权
				BotAPI.Use(middlewares.AuthMiddleware())

				// 机器人基础管理接口
				BotAPI.GET("/list", middlewares.PermissionMiddleware(permission.BotRead), bot.List)        // 获取机器人列表
				BotAPI.POST("/info", middlewares.PermissionMiddleware(permission.BotRead), bot.Info)       // 查询机器人信息
				BotAPI.POST("/create", middlewares.PermissionMiddleware(permission.BotCreate), bot.Create) // 创建机器人
				// BotAPI.POST("/botgroup", middlewares.PermissionMiddleware(permission.BotCreate), bot.CreateBotGroup) // 创建群组机器人
				BotAPI.POST("/copy", middlewares.PermissionMiddleware(permission.BotCreate), bot.Copy)     // 复制机器人
				BotAPI.DELETE("/info", middlewares.PermissionMiddleware(permission.BotDelete), bot.Delete) // 删除机器人

				// 机器人运行控制接口
				BotAPI.POST("/run", middlewares.PermissionMiddleware(permission.BotControl), bot.Run)         // 运行机器人
				BotAPI.POST("/stop", middlewares.PermissionMiddleware(permission.BotControl), bot.Stop)       // 停止机器人
				BotAPI.POST("/restart", middlewares.PermissionMiddleware(permission.BotControl), bot.Restart) // 重启机器人

				// 机器人日志管理接口
				BotAPI.POST("/log", middlewares.PermissionMiddleware(permission.BotLogManage), bot.Log)                 // 获取机器人日志
				BotAPI.POST("/log-online", middlewares.PermissionMiddleware(permission.BotLogManage), bot.LogOnline)    // 获取在线日志
				BotAPI.DELETE("/log", middlewares.PermissionMiddleware(permission.BotLogManage), bot.LogDelete)         // 删除日志
				BotAPI.GET("/log/download", middlewares.PermissionMiddleware(permission.BotLogManage), bot.LogDownload) // 下载整日日志

				// 进程端口信息接口
				BotAPI.GET("/process/:pid/ports", middlewares.PermissionMiddleware(permission.BotRead), bot.GetProcessPorts) // 获取进程端口信息

				// 机器人环境变量管理
				EnvAPI := BotAPI.Group("/env")
				{
					EnvAPI.POST("", middlewares.PermissionMiddleware(permission.BotConfigRead), botenv.Read)    // 读取环境变量
					EnvAPI.PUT("", middlewares.PermissionMiddleware(permission.BotConfigUpdate), botenv.Update) // 更新环境变量
				}

				// 机器人包管理
				PackageAPI := BotAPI.Group("/package")
				{
					PackageAPI.POST("", middlewares.PermissionMiddleware(permission.BotConfigRead), botpackage.Package)        // 获取包信息
					PackageAPI.PUT("", middlewares.PermissionMiddleware(permission.BotConfigUpdate), botpackage.PackageUpdate) // 更新包信息
				}

				// Yarn包管理
				YarnAPI := BotAPI.Group("/yarn")
				{
					YarnAPI.POST("/install", middlewares.PermissionMiddleware(permission.BotPackageManage), botwarehouse.YarnInstall) // 安装依赖
					YarnAPI.POST("/add", middlewares.PermissionMiddleware(permission.BotPackageManage), botwarehouse.YarnAdd)         // 添加依赖
					YarnAPI.POST("/remove", middlewares.PermissionMiddleware(permission.BotPackageManage), botwarehouse.YarnRemove)   // 移除依赖
				}

				// 机器人应用管理
				PackagesAPI := BotAPI.Group("/packages")
				{
					PackagesAPI.POST("", middlewares.PermissionMiddleware(permission.BotConfigRead), botpackages.PackagesInfo)          // 获取应用信息
					PackagesAPI.POST("/list", middlewares.PermissionMiddleware(permission.BotConfigRead), botpackages.PackagesList)     // 应用列表
					PackagesAPI.POST("/clone", middlewares.PermissionMiddleware(permission.BotConfigCreate), botpackages.PackagesClone) // 克隆应用
					PackagesAPI.PUT("/pkg", middlewares.PermissionMiddleware(permission.BotConfigUpdate), botpackages.PackagesUpdate)   // 更新应用
					PackagesAPI.DELETE("", middlewares.PermissionMiddleware(permission.BotConfigDelete), botpackages.PackagesDelete)    // 删除应用

					// Git操作相关
					PackagesAPI.POST("/pull", middlewares.PermissionMiddleware(permission.BotGitManage), botpackages.PackagesPull)      // 拉取应用
					PackagesAPI.GET("/gitbranches", middlewares.PermissionMiddleware(permission.BotGitManage), botpackages.GitBranches) // 获取Git分支
					PackagesAPI.GET("/gitcommits", middlewares.PermissionMiddleware(permission.BotGitManage), botpackages.GitCommits)   // 获取Git提交记录
					PackagesAPI.POST("/switch", middlewares.PermissionMiddleware(permission.BotGitManage), botpackages.PackagesSwitch)  // 切换分支/提交
					PackagesAPI.POST("/gitfetch", middlewares.PermissionMiddleware(permission.BotGitManage), botpackages.GitFetch)      // 获取最新分支信息

					// 强制更新
					PackagesPullAPI := PackagesAPI.Group("/pull")
					{
						PackagesPullAPI.POST("/force", middlewares.PermissionMiddleware(permission.BotGitManage), botpackages.PackegesForcedUpdate) // 强制更新
					}
				}

				// 机器人配置文件管理
				ConfigAPI := BotAPI.Group("/config")
				{
					ConfigAPI.POST("", middlewares.PermissionMiddleware(permission.BotConfigRead), botconfig.ConfigData)    // 获取配置数据
					ConfigAPI.PUT("", middlewares.PermissionMiddleware(permission.BotConfigUpdate), botconfig.ConfigUpdate) // 更新配置
				}

				// 机器人配置列表管理
				ConfigsAPI := BotAPI.Group("/configs")
				{
					ConfigsAPI.GET("", middlewares.PermissionMiddleware(permission.BotConfigRead), botconfigs.ConfigsList)        // 配置列表
					ConfigsAPI.POST("", middlewares.PermissionMiddleware(permission.BotConfigCreate), botconfigs.ConfigsData)     // 创建配置
					ConfigsAPI.PUT("", middlewares.PermissionMiddleware(permission.BotConfigUpdate), botconfigs.ConfigsUpdate)    // 更新配置
					ConfigsAPI.DELETE("", middlewares.PermissionMiddleware(permission.BotConfigDelete), botconfigs.ConfigsDelete) // 删除配置
				}

			}
			// MultiBot
			MultiBotAPI := v1.Group("/multibot")
			{
				// 创建多配置机器人
				MultiBotAPI.POST("/multibot", multibots.CreateMultiConfigBot)
				// 创建多配置机器人配置
				MultiBotAPI.POST("/addconfig", multibots.AddBotConfig)
				// 启动多配置机器人(根据配置文件启动对应的机器人)
				MultiBotAPI.POST("/start", multibots.StartMultiBot)
			}

			// Terminal - 仅超级管理员可使用
			TerminalAPI := v1.Group("/terminal")
			{
				TerminalAPI.GET("/ws", terminal.HandleWebSocket)              // WebSocket终端连接 - 使用 subprotocol 鉴权
				TerminalAPI.Use(middlewares.AuthMiddleware())                 // 开始鉴权
				TerminalAPI.GET("/sessions", terminal.GetSessions)            // 获取活跃会话列表 - 需要 HTTP 鉴权
				TerminalAPI.DELETE("/sessions/:id", terminal.CloseSessionAPI) // 关闭指定会话 - 需要 HTTP 鉴权
			}

			// SFTP-like 文件管理（限制在 work/ 根目录）
			SFTPAPI := v1.Group("/sftp")
			{
				// 查询需读取权限，写入需系统设置管理权限
				SFTPAPI.Use(middlewares.AuthMiddleware())
				SFTPAPI.GET("/info", middlewares.PermissionMiddleware(permission.SystemConfigRead), sftp.Info)                     // 基础信息
				SFTPAPI.GET("/list", middlewares.PermissionMiddleware(permission.SystemConfigRead), sftp.List)                     // 列目录/文件
				SFTPAPI.GET("/read", middlewares.PermissionMiddleware(permission.SystemConfigRead), sftp.Read)                     // 读取小文件文本
				SFTPAPI.GET("/download", middlewares.PermissionMiddleware(permission.SystemConfigRead), sftp.Download)             // 下载文件
				SFTPAPI.GET("/zip", middlewares.PermissionMiddleware(permission.SystemConfigRead), sftp.Zip)                       // 单个路径zip下载
				SFTPAPI.POST("/zip-batch", middlewares.PermissionMiddleware(permission.SystemConfigRead), sftp.ZipBatch)           // 批量zip下载
				SFTPAPI.POST("/upload", middlewares.PermissionMiddleware(permission.SystemSettingsManage), sftp.Upload)            // 上传文件
				SFTPAPI.POST("/write", middlewares.PermissionMiddleware(permission.SystemSettingsManage), sftp.Write)              // 写入文本文件
				SFTPAPI.POST("/mkdir", middlewares.PermissionMiddleware(permission.SystemSettingsManage), sftp.Mkdir)              // 新建目录
				SFTPAPI.POST("/rename", middlewares.PermissionMiddleware(permission.SystemSettingsManage), sftp.Rename)            // 重命名/移动
				SFTPAPI.POST("/copy", middlewares.PermissionMiddleware(permission.SystemSettingsManage), sftp.Copy)                // 复制
				SFTPAPI.DELETE("/delete", middlewares.PermissionMiddleware(permission.SystemSettingsManage), sftp.Delete)          // 删除
				SFTPAPI.POST("/delete-batch", middlewares.PermissionMiddleware(permission.SystemSettingsManage), sftp.DeleteBatch) // 批量删除
			}

			// Port Monitor - 端口监控
			PortMonitorAPI := v1.Group("/port-monitor")
			{
				PortMonitorAPI.Use(middlewares.AuthMiddleware())                                                                              // 开始鉴权
				PortMonitorAPI.GET("/ports", middlewares.PermissionMiddleware(permission.SystemConfigRead), portMonitor.GetAllPorts)          // 获取所有端口信息
				PortMonitorAPI.GET("/ports/:port", middlewares.PermissionMiddleware(permission.SystemConfigRead), portMonitor.GetPortsByPort) // 根据端口号获取端口信息
				PortMonitorAPI.GET("/process", middlewares.PermissionMiddleware(permission.SystemConfigRead), portMonitor.GetPortsByProcess)  // 根据进程名获取端口信息
			}
		}
	}

	return app
}
