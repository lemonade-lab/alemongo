package user

import (
	"alemongo/src/apps/api/requests"
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"net/http"

	"github.com/gin-gonic/gin"
)

// method: PUT
func PassWord(ctx *gin.Context) {
	oldPassword := ctx.PostForm("old_password")
	password := ctx.PostForm("password")

	// 相同
	if password == oldPassword {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "新密码不能和旧密码相同")
		return
	}
	username, exists := requests.GetUserName(ctx)
	if !exists {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "错误请求")
		return
	}

	if err := logic.ChangePassword(username, oldPassword, password); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}

	response.ResponseSuccess(ctx, nil)
}
