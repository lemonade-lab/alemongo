package middlewares

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/pkgs/session"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware 基于 Session 的认证中间件
func AuthMiddleware() func(c *gin.Context) {
	return func(c *gin.Context) {
		// 从 cookie 中读取 session ID
		sessionID, err := c.Cookie(session.CookieName)
		if err != nil || sessionID == "" {
			response.ResponseError(c, http.StatusUnauthorized, response.SessionInvalid)
			c.Abort()
			return
		}

		// 查询 session
		data, ok := session.Get(sessionID)
		if !ok {
			response.ResponseError(c, http.StatusUnauthorized, response.SessionInvalid)
			c.Abort()
			return
		}

		c.Set("username", data.Username)
		c.Set("sessionID", sessionID)
		c.Next()
	}
}
