package route

import (
	"alemongo/src/apps/api/bot"
	"alemongo/src/apps/api/common"
	"alemongo/src/apps/api/gitssh"
	"alemongo/src/apps/api/receive"
	"alemongo/src/apps/api/settings"
	"alemongo/src/apps/api/user"
	"alemongo/src/logger"
	"alemongo/src/middlewares"

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

func Create(mode string) *gin.Engine {
	// 根据 mode 设置 发布模式/开发模式
	if mode == gin.ReleaseMode {
		gin.SetMode(gin.ReleaseMode)
	}

	// 创建路由
	r := gin.New()

	// 实例化app
	app := Use(r)

	// 接口api
	api := app.Group("/api")
	{
		// 接口 v
		v1 := api.Group("/v1")
		{
			ReceiveAPI := v1.Group("/receive")
			{
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
				// 重置基础机器人模板
				SettingsAPI.POST("/template/reset", settings.ResetTemplate)
			}
			// user api
			UserAPI := v1.Group("/user")
			{
				// 登录
				UserAPI.POST("/login", user.Login)
				// 开始鉴权
				UserAPI.Use(middlewares.AuthMiddleware())
				// 退出登录
				UserAPI.GET("/logout", user.Logout)
				// 获取用户信息
				UserAPI.GET("/info", user.Info)
				// 修改密码
				UserAPI.PUT("/password", user.PassWord)
				// 列表
				UserAPI.GET("/list", user.List)
				// 添加
				UserAPI.POST("/create", user.CreateUserHandler)
				// 删除
				UserAPI.DELETE("/delete", user.DeleteUserHandler)
				// 修改身份
				UserAPI.PUT("/identity", user.Identity)
				// 身份列表
				UserAPI.GET("/identity/list", user.IdentityList)
				// 绑定邮箱
				UserAPI.POST("/bind_email", user.BindEmailHandler)
				// 验证邮箱
				UserAPI.POST("/verify_email", user.VerifyEmailHandler)
			}
			// ssh
			SSHAPI := v1.Group("/ssh")
			{
				// 开始鉴权
				SSHAPI.Use(middlewares.AuthMiddleware())
				// 列表
				SSHAPI.GET("/list", gitssh.List)
				// 更新
				SSHAPI.PUT("/update", gitssh.Update)
				// 删除
				SSHAPI.DELETE("/delete", gitssh.Delete)
				// 读取
				SSHAPI.GET("/read", gitssh.Read)
			}
			// bot
			BotAPI := v1.Group("/bot")
			{
				// 开始鉴权
				BotAPI.Use(middlewares.AuthMiddleware())
				BotAPI.GET("/list", bot.List)
				BotAPI.POST("/create", bot.Create)
				BotAPI.POST("/info", bot.Info)
				BotAPI.DELETE("/info", bot.Delete)
				BotAPI.POST("/run", bot.Run)
				BotAPI.POST("/stop", bot.Stop)
				BotAPI.POST("/restart", bot.Restart)
				BotAPI.POST("/log", bot.Log)

				PackageAPI := BotAPI.Group("/package")
				{
					PackageAPI.POST("/", bot.Package)
					PackageAPI.POST("/update", bot.PackageUpdate)
				}

				YarnAPI := BotAPI.Group("/yarn")
				{
					YarnAPI.POST("/install", bot.YarnInstall)
					YarnAPI.POST("/add", bot.YarnAdd)
					YarnAPI.POST("/remove", bot.YarnRemove)
				}

				PackagesAPI := BotAPI.Group("/packages")
				{
					PackagesAPI.POST("/info", bot.PackagesInfo)
					PackagesAPI.DELETE("/info", bot.PackageDelete)
					PackagesAPI.POST("/clone", bot.PackagesClone)
					PackagesAPI.POST("/list", bot.PackagesList)
					PackagesAPI.POST("/pull", bot.PackagesPull)
					PackagesPullAPI := PackagesAPI.Group("/pull")
					{
						PackagesPullAPI.POST("/force", bot.PackegForcedUpdate)
					}
				}

				ConfigAPI := BotAPI.Group("/config")
				{
					ConfigAPI.POST("/", bot.ConfigData)
					ConfigAPI.POST("/update", bot.ConfigUpdate)
				}

				ConfigsAPI := BotAPI.Group("/configs")
				{
					ConfigsAPI.POST("/", bot.ConfigsData)
					ConfigsAPI.GET("/list", bot.ConfigsList)
					ConfigsAPI.POST("/update", bot.ConfigsUpdate)
					ConfigsAPI.DELETE("/delete", bot.ConfigsDelete)
				}

			}
		}
	}
	return app
}
