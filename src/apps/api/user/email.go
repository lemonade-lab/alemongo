package user

import (
	"alemongo/src/apps/api/requests"
	"alemongo/src/apps/api/response"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

func BindEmailHandler(ctx *gin.Context) {
	username, exists := requests.GetUserName(ctx)
	if !exists {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "错误请求")
		return
	}
	email := strings.TrimSpace(ctx.PostForm("email"))
	if email == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "邮箱不能为空")
		return
	}
	logic.BindEmail(username, email)

}
