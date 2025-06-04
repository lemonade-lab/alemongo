package user

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 退出登录
func Logout(ctx *gin.Context) {
	tokenValue, exists := ctx.Get("token")
	if !exists {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "无效token")
		return
	}
	err := logic.Logout(tokenValue.(string))

	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "退出登录失败")
		return
	}
	response.ResponseSuccess(ctx, nil)
}
