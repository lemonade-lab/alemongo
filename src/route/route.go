package route

import (
	"alemongo/src/apps/api/bot"
	botconfig "alemongo/src/apps/api/bot/config"
	botconfigs "alemongo/src/apps/api/bot/configs"

	apiemail "alemongo/src/apps/api/email"

	botenv "alemongo/src/apps/api/bot/env"
	botpackage "alemongo/src/apps/api/bot/package"
	botpackages "alemongo/src/apps/api/bot/packages"
	botwarehouse "alemongo/src/apps/api/bot/warehouse"

	"alemongo/src/apps/api/common"
	"alemongo/src/apps/api/gitssh"
	"alemongo/src/apps/api/receive"
	"alemongo/src/apps/api/settings"
	"alemongo/src/apps/api/user"
	"alemongo/src/logger"
	"alemongo/src/middlewares"

	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
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

	if mode == gin.DebugMode {
		gin.SetMode(gin.DebugMode)
	} else if mode == gin.TestMode {
		gin.SetMode(gin.TestMode)
	} else {
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

			ReceiveAPI := v1.Group("/receive")
			{
				//
				ReceiveAPI.POST("/", receive.POST)
			}
			CommonAPI := v1.Group("/common")
			{
				// 获取环境信息
				CommonAPI.GET("/info", common.Info)
			}
			// settings
			SettingsAPI := v1.Group("/settings")
			{
				// 开机自启
				SettingsAPI.GET("/powerboot", settings.PowerBoot)
				// 获取开机自启动状态
				SettingsAPI.GET("/powerboot/status", settings.GetAutoStartStatus)
				// 重置基础机器人模板
				SettingsAPI.POST("/template/reset", settings.ResetTemplate)
			}

			// config api
			ConfigAPI := v1.Group("/config")
			{
				// 开始鉴权
				ConfigAPI.Use(middlewares.AuthMiddleware())
				EmailAPI := ConfigAPI.Group("/email")
				{
					// 获取配置
					EmailAPI.GET("", apiemail.GetEmail)
					// 更改邮箱配置
					EmailAPI.PUT("", apiemail.UpdateEmail)
				}

			}

			// user api
			UserAPI := v1.Group("/user")
			{
				UserAPI.POST("/login", user.Login)                               // 登录
				UserAPI.GET("/github/auth-url", user.GetGitHubAuthURL)           // 获取 GitHub 授权 URL
				UserAPI.GET("/github/config-status", user.GetGitHubConfigStatus) // 获取 GitHub 配置状态
				UserAPI.POST("/github/login", user.GitHubLogin)                  // GitHub 快捷登录
				UserAPI.POST("/github/unbind", user.UnbindGitHubAccount)         // GitHub 解绑（需要认证）
				UserAPI.POST("/github/bind", user.BindGitHubAccount)             // GitHub 绑定（需要认证）
				UserAPI.Use(middlewares.AuthMiddleware())                        // 开始鉴权
				UserAPI.GET("/logout", user.Logout)                              // 退出登录
				UserAPI.GET("/info", user.Info)                                  // 获取用户信息
				UserAPI.PUT("/password", user.PassWord)                          // 修改密码
				UserAPI.GET("/list", user.List)                                  // 列表
				UserAPI.POST("/create", user.CreateUserHandler)                  // 添加
				UserAPI.DELETE("/delete", user.DeleteUserHandler)                // 删除
				UserAPI.PUT("/identity", user.Identity)                          // 修改身份
				UserAPI.GET("/identity/list", user.IdentityList)                 // 身份列表
				UserAPI.POST("/bind_email", user.BindEmailHandler)               // 绑定邮箱
				UserAPI.POST("/verify_email", user.VerifyEmailHandler)           // 验证邮箱
			}
			// ssh
			SSHAPI := v1.Group("/ssh")
			{
				// 开始鉴权
				SSHAPI.Use(middlewares.AuthMiddleware())
				// 列表
				SSHAPI.GET("/list", gitssh.List)
				// 创建
				SSHAPI.POST("", gitssh.GenerateSSH)
				// 删除
				SSHAPI.DELETE("", gitssh.Delete)
				// 更新
				SSHAPI.PUT("", gitssh.Update)
				// 读取
				SSHAPI.GET("", gitssh.Read)
				// 授权地址
				SSHAPI.POST("/authorize", gitssh.Authorize)
			}

			// bot
			BotAPI := v1.Group("/bot")
			{
				// 开始鉴权
				BotAPI.Use(middlewares.AuthMiddleware())
				// 获取机器人列表
				BotAPI.GET("/list", bot.List)
				// 查询
				BotAPI.POST("/info", bot.Info)
				// 创建
				BotAPI.POST("/create", bot.Create)
				// 创建群组机器人
				BotAPI.POST("/botgroup", bot.CreateBotGroup)
				// 删除
				BotAPI.DELETE("/info", bot.Delete)
				// 运行
				BotAPI.POST("/run", bot.Run)
				// 停止
				BotAPI.POST("/stop", bot.Stop)
				// 重启
				BotAPI.POST("/restart", bot.Restart)
				// 复制机器人
				BotAPI.POST("/copy", bot.Copy)
				// logs
				BotAPI.POST("/log", bot.Log)
				BotAPI.POST("/log-online", bot.LogOnline)
				// 删除logs
				BotAPI.DELETE("/log", bot.LogDelete)

				EnvAPI := BotAPI.Group("/env")
				{
					EnvAPI.POST("", botenv.Read)
					EnvAPI.PUT("", botenv.Update)
				}

				PackageAPI := BotAPI.Group("/package")
				{
					// 获取包信息
					PackageAPI.POST("", botpackage.Package)

					// 更新包信息
					PackageAPI.PUT("", botpackage.PackageUpdate)
				}

				YarnAPI := BotAPI.Group("/yarn")
				{
					YarnAPI.POST("/install", botwarehouse.YarnInstall)
					YarnAPI.POST("/add", botwarehouse.YarnAdd)
					YarnAPI.POST("/remove", botwarehouse.YarnRemove)
				}

				PackagesAPI := BotAPI.Group("/packages")
				{
					PackagesAPI.POST("", botpackages.PackagesInfo)
					PackagesAPI.DELETE("", botpackages.PackagesDelete)
					PackagesAPI.PUT("/pkg", botpackages.PackagesUpdate)
					PackagesAPI.POST("/clone", botpackages.PackagesClone)
					PackagesAPI.POST("/list", botpackages.PackagesList)
					PackagesAPI.POST("/pull", botpackages.PackagesPull)
					PackagesPullAPI := PackagesAPI.Group("/pull")
					{
						PackagesPullAPI.POST("/force", botpackages.PackegesForcedUpdate)
					}
					// 返回包的git branches 信息
					PackagesAPI.GET("/gitbranches", botpackages.GitBranches)
					// 返回包的git branch 对应的所有 commit 记录
					PackagesAPI.GET("/gitcommits", botpackages.GitCommits)
					// 切换当前包到指定的branch/commit
					PackagesAPI.POST("/switch", botpackages.PackagesSwitch)
					// 从远程获取最新分支信息
					PackagesAPI.POST("/gitfetch", botpackages.GitFetch)
				}

				ConfigAPI := BotAPI.Group("/config")
				{
					ConfigAPI.POST("", botconfig.ConfigData)
					ConfigAPI.PUT("", botconfig.ConfigUpdate)
				}

				ConfigsAPI := BotAPI.Group("/configs")
				{
					ConfigsAPI.GET("", botconfigs.ConfigsList)
					ConfigsAPI.POST("", botconfigs.ConfigsData)
					ConfigsAPI.PUT("", botconfigs.ConfigsUpdate)
					ConfigsAPI.DELETE("", botconfigs.ConfigsDelete)
				}

			}
		}
	}

	return app
}
