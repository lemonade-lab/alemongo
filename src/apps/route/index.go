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
				ApiBot.POST("/package", bot.Package)
				ApiBot.POST("/package/update", bot.PackageUpdate)
				// config
				ApiBot.POST("/config", bot.ConfigData)
				ApiBot.POST("/config/update", bot.ConfigUpdate)
				// yarn
				ApiBot.POST("/yarn/install", bot.YarnInstall)
				ApiBot.POST("/yarn/add", bot.YarnAdd)
				ApiBot.POST("/yarn/remove", bot.YarnRemove)
				// Packages
				ApiBot.POST("/packages/clone", bot.PackagesClone)
				ApiBot.POST("/packages/list", bot.PackagesList)
				ApiBot.POST("/packages/pull", bot.PackagesPull)
				// configs
				ApiBot.GET("/configs/list", bot.ConfigsList)
				ApiBot.POST("/configs", bot.ConfigsData)
				ApiBot.POST("/configs/update", bot.ConfigsUpdate)
			}
		}
	}
	return app
}
