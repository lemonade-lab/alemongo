package user

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"alemongo/src/logic"
	"github.com/gin-gonic/gin"
	"net/http"
)

// 登录
func Login(ctx *gin.Context) {
	username := ctx.PostForm("username")
	password := ctx.PostForm("password")

	// 检查是否被锁定
	if locked, remainingTime := dao.IsAccountLocked(username); locked {
		response.ResponseErrorWithData(ctx, http.StatusTooManyRequests,
			http.StatusTooManyRequests,
			"账户已被锁定，请稍后再试",
			gin.H{"remaining_time": remainingTime})
		return
	}

	tokenValue, err := logic.Login(username, password)

	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}

	// 反馈
	response.ResponseSuccess(ctx, tokenValue)
}
