package middleware

import (
	"alemongo/src/logger"
	"github.com/gin-gonic/gin"
)

// 跨域请求中间件
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 设置允许的来源，* 表示允许所有来源
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		// 设置允许的 HTTP 方法
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST")
		// 设置允许的请求头
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, authorization")
		// 处理 OPTIONS 请求，该请求用于预检（preflight）请求，用于检查实际请求是否安全
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204) // 返回 204 No Content
			return
		}
		c.Next()
	}
}

// 路由初始化
func Use(r *gin.Engine) *gin.Engine {
	// 添加跨域请求中间件
	r.Use(corsMiddleware())
	// 添加自定义日志中间件
	r.Use(logger.GinLogger(), logger.GinRecovery(true))
	return r
}
