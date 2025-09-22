package apiconfig

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"alemongo/src/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// UpdateGitHubConfig 更新GitHub OAuth配置
// @Summary 更新GitHub OAuth配置
// @Description 仅超级管理员可操作
// @Tags 配置管理
// @Accept json
// @Produce json
// @Param config body models.GitHubConfig true "GitHub配置"
// @Success 200 {object} response.ResponseData "成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 401 {object} response.ResponseData "未授权"
// @Failure 403 {object} response.ResponseData "权限不足"
// @Router /config/github [put]
func UpdateGitHubConfig(ctx *gin.Context) {
	var githubConfig models.GitHubConfig
	if err := ctx.ShouldBind(&githubConfig); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "参数有误")
		return
	}
	
	if err := logic.EditGitHubConfig(githubConfig); err != nil {
		zap.L().Error(err.Error())
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "系统错误，修改GitHub配置失败")
		return
	}
	
	response.ResponseSuccess(ctx, nil)
}

// GetGitHubConfig 获取GitHub OAuth配置
// @Summary 获取GitHub OAuth配置
// @Description 仅超级管理员可操作
// @Tags 配置管理
// @Produce json
// @Success 200 {object} response.ResponseData{data=models.GitHubConfig} "成功"
// @Failure 401 {object} response.ResponseData "未授权"
// @Failure 403 {object} response.ResponseData "权限不足"
// @Router /config/github [get]
func GetGitHubConfig(ctx *gin.Context) {
	githubConfig, err := logic.GetGitHubConfig()
	if err != nil {
		zap.L().Error(err.Error())
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "系统错误，获取GitHub配置失败")
		return
	}
	response.ResponseSuccess(ctx, githubConfig)
}

// GetGitHubConfigStatus 获取GitHub配置状态
// @Summary 获取GitHub配置状态
// @Description 获取GitHub OAuth配置的完整性状态
// @Tags 配置管理
// @Produce json
// @Success 200 {object} response.ResponseData{data=map[string]interface{}} "成功"
// @Router /config/github/status [get]
func GetGitHubConfigStatus(ctx *gin.Context) {
	status := logic.GetGitHubConfigStatus()
	response.ResponseSuccess(ctx, status)
}
