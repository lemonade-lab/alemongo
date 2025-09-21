package user

import (
	"alemongo/src/apps/api/requests"
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 获取用户信息
func Info(ctx *gin.Context) {
	username, exists := requests.GetUserName(ctx)
	if !exists {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "错误请求")
		return
	}
	userInfo, err := logic.GetUserInfo(username)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	response.ResponseSuccess(ctx, userInfo)
}
