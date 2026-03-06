package user

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"alemongo/src/logic"
	"alemongo/src/models"
	"alemongo/src/pkgs/session"
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

// GetGitHubConfigStatus 获取 GitHub 配置状态
// @Summary 获取 GitHub 配置状态
// @Success 200 {object} response.ResponseData{data=object} "成功"
// @Router /user/github/config-status [get]
func GetGitHubConfigStatus(ctx *gin.Context) {
	config := logic.GetGitHubConfigStatus()
	response.ResponseSuccess(ctx, config)
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
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	// 验证授权码
	if req.Code == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "授权码不能为空")
		return
	}

	loginUser, err := logic.GitHubLogin(req.Code)
	if err != nil {
		// 根据错误类型返回不同的状态码
		statusCode := http.StatusBadRequest
		if err.Error() == "该 GitHub 账号未绑定任何用户，请先绑定" {
			statusCode = http.StatusUnauthorized
		}
		response.ResponseErrorWithMsg(ctx, statusCode, http.StatusBadRequest, err.Error())
		return
	}

	// 创建 session 并设置 cookie
	sessionID, err := session.Create(loginUser)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "创建会话失败")
		return
	}

	ctx.SetCookie(session.CookieName, sessionID, session.MaxAge(), "/", "", false, true)

	response.ResponseSuccess(ctx, nil)
}

// BindGitHubAccount 绑定 GitHub 账号
// @Summary 绑定 GitHub 账号
// @Param code formData string true "授权码"
// @Success 200 {object} response.ResponseData "成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 401 {object} response.ResponseData "认证失败"
// @Router /user/github/bind [post]
func BindGitHubAccount(ctx *gin.Context) {
	// 从 session 中获取当前登录的用户名
	username, exists := ctx.Get("username")
	if !exists {
		response.ResponseErrorWithMsg(ctx, http.StatusUnauthorized, http.StatusUnauthorized, "未登录")
		return
	}

	code := ctx.PostForm("code")
	if code == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "授权码不能为空")
		return
	}

	// 临时超级管理员不能绑定 GitHub 账号
	if dao.IsTemporarySuperAdmin(username.(string)) {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "临时超级管理员不能绑定 GitHub 账号，请先修改密码")
		return
	}

	err := logic.BindGitHubAccount(username.(string), code)
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
