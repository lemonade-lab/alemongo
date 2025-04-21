package route

import (
	"alemongo/src/apps/api/bot"
	"alemongo/src/apps/api/common"
	"alemongo/src/apps/api/users"
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
				ApiUser.POST("/login", users.Login)
				// 开始鉴权
				ApiUser.Use(token.AuthMiddleware)
				// 退出登录
				ApiUser.GET("/logout", users.Logout)
				// 获取用户信息
				ApiUser.GET("/info", users.Info)
				// 修改密码
				ApiUser.PUT("/password", users.PassWord)
			}
			ApiBot := v1.Group("/bot")
			{
				// 开始鉴权
				ApiBot.Use(token.AuthMiddleware)
				// more ...
				ApiBot.GET("/list", bot.List)
				ApiBot.POST("/install", bot.Install)
				ApiBot.POST("/info", bot.Info)
				ApiBot.DELETE("/info", bot.Delete)
				ApiBot.POST("/create", bot.Create)
				ApiBot.POST("/run", bot.Run)
				ApiBot.POST("/stop", bot.Stop)
				ApiBot.POST("/restart", bot.Restart)
				ApiBot.POST("/config", bot.Config)
				ApiBot.POST(("/log"), bot.Log)
			}
		}
	}
	return app
}
