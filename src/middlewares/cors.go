package middlewares

import "github.com/gin-gonic/gin"

// 跨域请求中间件
func CorsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}
		// 设置允许的 HTTP 方法
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
		// 设置允许的请求头
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type")
		// 允许携带凭据（cookie）
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		// 处理 OPTIONS 请求，该请求用于预检（preflight）请求，用于检查实际请求是否安全
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204) // 返回 204 No Content
			return
		}
		c.Next()
	}
}
