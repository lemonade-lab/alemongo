package user

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"alemongo/src/logic"
	"github.com/gin-gonic/gin"
	"net/http"
)

// Login 登陆接口
// @Summary 登陆接口
// @Param username formData string true "用户名"
// @Param password formData string true "密码"
// @Success 200 {object} response.ResponseData{data=string} "成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 401 {object} response.ResponseData "用户名或密码错误"
// @Failure 429 {object} response.ResponseData "账户已被锁定"
// @Router /user/login [post]
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
