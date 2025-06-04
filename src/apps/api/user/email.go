package user

import (
	"alemongo/src/apps/api/requests"
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"strings"
)

func BindEmailHandler(ctx *gin.Context) {
	_, exists := requests.GetUserName(ctx)
	if !exists {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "错误请求")
		return
	}
	email := strings.TrimSpace(ctx.PostForm("email"))
	if email == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "邮箱不能为空")
		return
	}
	err := logic.BindEmail(email)
	if err != nil {
		log.Printf("BindEmail error:%v", err)
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	response.ResponseSuccess(ctx, nil)
}

func VerifyEmailHandler(ctx *gin.Context) {
	username, exists := requests.GetUserName(ctx)
	if !exists {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "错误请求")
		return
	}
	email := strings.TrimSpace(ctx.PostForm("email"))
	code := strings.TrimSpace(ctx.PostForm("code"))
	if email == "" || code == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "邮箱/验证码不能为空")
		return
	}

	if err := logic.VerifyEmail(username, email, code); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	response.ResponseSuccess(ctx, "绑定成功")
}
