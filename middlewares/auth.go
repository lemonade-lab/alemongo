package middlewares

import (
	"alemongo/pkgs/jwt"
	"alemongo/src/apps/api/response"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

// AuthMiddleware 基于JWT的认证中间件
func AuthMiddleware() func(c *gin.Context) {
	return func(c *gin.Context) {
		// Token放在请求头
		authHeader := c.Request.Header.Get("Authorization")
		if authHeader == "" {
			response.ResponseError(c, http.StatusBadRequest, response.TokenInvalid)
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			response.ResponseError(c, http.StatusUnauthorized, response.TokenInvalid)
			c.Abort()
			return
		}
		// 解析token
		tokenValue := parts[1]
		mc, err := jwt.ParseToken(tokenValue)
		if err != nil {
			response.ResponseError(c, http.StatusUnauthorized, response.TokenInvalid)
			c.Abort()
			return
		}
		c.Set("token", tokenValue)
		c.Set("username", mc.Username)
		c.Next()
	}
}
