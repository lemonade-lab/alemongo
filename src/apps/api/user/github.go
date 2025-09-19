package user

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"alemongo/src/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetGitHubAuthURL 获取 GitHub 授权 URL
// @Summary 获取 GitHub 授权 URL
// @Param state query string false "状态参数"
// @Success 200 {object} response.ResponseData{data=string} "成功"
// @Router /user/github/auth-url [get]
func GetGitHubAuthURL(ctx *gin.Context) {
	state := ctx.Query("state")
	if state == "" {
		state = "login" // 默认状态
	}

	authURL := logic.GetGitHubAuthURL(state)
	response.ResponseSuccess(ctx, authURL)
}

// GitHubLogin GitHub 快捷登录
// @Summary GitHub 快捷登录
// @Param code formData string true "授权码"
// @Success 200 {object} response.ResponseData{data=string} "成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 401 {object} response.ResponseData "登录失败"
// @Router /user/github/login [post]
func GitHubLogin(ctx *gin.Context) {
	var req models.GitHubOAuthRequest
	if err := ctx.ShouldBind(&req); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "参数错误")
		return
	}

	tokenValue, err := logic.GitHubLogin(req.Code)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}

	response.ResponseSuccess(ctx, tokenValue)
}

// BindGitHubAccount 绑定 GitHub 账号
// @Summary 绑定 GitHub 账号
// @Param username formData string true "用户名"
// @Param password formData string true "密码"
// @Param code formData string true "授权码"
// @Success 200 {object} response.ResponseData "成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 401 {object} response.ResponseData "认证失败"
// @Router /user/github/bind [post]
func BindGitHubAccount(ctx *gin.Context) {
	var req models.GitHubBindRequest
	if err := ctx.ShouldBind(&req); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "参数错误")
		return
	}

	code := ctx.PostForm("code")
	if code == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "授权码不能为空")
		return
	}

	err := logic.BindGitHubAccount(req.Username, req.Password, code)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}

	response.ResponseSuccess(ctx, "绑定成功")
}

// UnbindGitHubAccount 解绑 GitHub 账号
// @Summary 解绑 GitHub 账号
// @Success 200 {object} response.ResponseData "成功"
// @Failure 400 {object} response.ResponseData "解绑失败"
// @Router /user/github/unbind [post]
func UnbindGitHubAccount(ctx *gin.Context) {
	username, exists := ctx.Get("username")
	if !exists {
		response.ResponseErrorWithMsg(ctx, http.StatusUnauthorized, http.StatusUnauthorized, "未登录")
		return
	}

	err := logic.UnbindGitHubAccount(username.(string))
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}

	response.ResponseSuccess(ctx, "解绑成功")
}
