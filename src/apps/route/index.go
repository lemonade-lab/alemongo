package route

import (
	"alemongo/src/apps/api/bot"
	"alemongo/src/apps/api/common"
	"alemongo/src/apps/api/user"
	"alemongo/src/apps/middleware"
	"alemongo/src/apps/token"
	"os"

	"github.com/gin-gonic/gin"
)

func Create() *gin.Engine {
	args := os.Args

	// 是不 go run main.go dev 就使用开发模式
	if len(args) <= 1 || args[1] != "dev" {
		gin.SetMode(gin.ReleaseMode)
	}

	// 创建路由
	r := gin.New()

	// 实例化app
	app := middleware.Use(r)

	// 接口api
	api := app.Group("/api")
	{
		// 接口 v
		v1 := api.Group("/v1")
		{
			CommonApi := v1.Group("/common")
			{
				// 获取环境信息
				CommonApi.GET("/info", common.Info)
			}
			// user api
			ApiUser := v1.Group("/user")
			{
				// 登录
				ApiUser.POST("/login", user.Login)
				// 开始鉴权
				ApiUser.Use(token.AuthMiddleware)
				// 退出登录
				ApiUser.GET("/logout", user.Logout)
				// 获取用户信息
				ApiUser.GET("/info", user.Info)
				// 修改密码
				ApiUser.PUT("/password", user.PassWord)
				// 列表
				ApiUser.GET("/list", user.List)
				// 添加
				ApiUser.POST("/create", user.Create)
				// 删除
				ApiUser.DELETE("/delete", user.Delete)
			}
			ApiBot := v1.Group("/bot")
			{
				// 开始鉴权
				ApiBot.Use(token.AuthMiddleware)
				ApiBot.GET("/list", bot.List)
				ApiBot.POST("/create", bot.Create)
				ApiBot.POST("/info", bot.Info)
				ApiBot.DELETE("/info", bot.Delete)
				ApiBot.POST("/run", bot.Run)
				ApiBot.POST("/stop", bot.Stop)
				ApiBot.POST("/restart", bot.Restart)
				ApiBot.POST("/log", bot.Log)

				ApiPackage := ApiBot.Group("/package")
				{
					ApiPackage.POST("/", bot.Package)
					ApiPackage.POST("/update", bot.PackageUpdate)
				}

				ApiYarn := ApiBot.Group("/yarn")
				{
					ApiYarn.POST("/install", bot.YarnInstall)
					ApiYarn.POST("/add", bot.YarnAdd)
					ApiYarn.POST("/remove", bot.YarnRemove)
				}

				ApiPackages := ApiBot.Group("/packages")
				{
					ApiPackages.POST("/clone", bot.PackagesClone)
					ApiPackages.POST("/list", bot.PackagesList)
					ApiPackages.POST("/pull", bot.PackagesPull)
				}

				ApiConfig := ApiBot.Group("/config")
				{
					ApiConfig.POST("/", bot.ConfigData)
					ApiConfig.POST("/update", bot.ConfigUpdate)
				}

				ApiConfigs := ApiBot.Group("/configs")
				{
					ApiConfigs.POST("/", bot.ConfigsData)
					ApiConfigs.GET("/list", bot.ConfigsList)
					ApiConfigs.POST("/update", bot.ConfigsUpdate)
				}

			}
		}
	}
	return app
}
