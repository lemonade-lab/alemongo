package common

import (
	"alemongo/src/logic"
	"alemongo/src/settings"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GeneralConfigResponse 一般配置响应结构
type GeneralConfigResponse struct {
	GitHub GitHubConfig `json:"github"`
	App    AppConfig    `json:"app"`
	UI     UIConfig     `json:"ui"`
}

// GitHubConfig GitHub相关配置
type GitHubConfig struct {
	LoginEnabled bool `json:"login_enabled"` // GitHub快捷登录是否启用
}

// AppConfig 应用相关配置
type AppConfig struct {
	Name        string `json:"name"`         // 应用名称
	Version     string `json:"version"`      // 应用版本
	BuildTime   string `json:"build_time"`   // 构建时间
	ServiceName string `json:"service_name"` // 服务名称
}

// UIConfig 前端UI相关配置
type UIConfig struct {
	ShowGitHubLogin bool `json:"show_github_login"` // 是否显示GitHub登录按钮
}

// @Summary 获取一般配置信息
// @Description 获取不需要登录权限的一般配置信息，如GitHub登录是否启用等
// @Tags 公共
// @Accept json
// @Produce json
// @Success 200 {object} GeneralConfigResponse
// @Router /common/config [get]
func GetGeneralConfig(ctx *gin.Context) {
	// 获取GitHub配置状态
	githubConfigStatus := logic.GetGitHubConfigStatus()

	// 检查GitHub配置是否完整，只有完整配置才启用GitHub登录
	githubLoginEnabled := false
	if fullyConfigured, ok := githubConfigStatus["fully_configured"].(bool); ok {
		githubLoginEnabled = fullyConfigured
	}

	// 获取应用基础信息
	baseInfo := settings.GetBaseInfo()

	// 构建响应数据
	response := GeneralConfigResponse{
		GitHub: GitHubConfig{
			LoginEnabled: githubLoginEnabled,
		},
		App: AppConfig{
			Name:        settings.Conf.Name,
			Version:     baseInfo.Version,
			BuildTime:   baseInfo.BuildTime,
			ServiceName: settings.ServiceName,
		},
		UI: UIConfig{
			ShowGitHubLogin: githubLoginEnabled, // UI显示GitHub登录按钮与GitHub登录启用状态一致
		},
	}

	// 返回JSON响应
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": response,
	})
}
