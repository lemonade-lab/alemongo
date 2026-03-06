package user

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/pkgs/session"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 退出登录
func Logout(ctx *gin.Context) {
	sessionID, exists := ctx.Get("sessionID")
	if !exists {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "无效会话")
		return
	}

	// 删除服务端会话
	session.Delete(sessionID.(string))

	// 清除 cookie
	ctx.SetCookie(session.CookieName, "", -1, "/", "", false, true)

	response.ResponseSuccess(ctx, nil)
}
