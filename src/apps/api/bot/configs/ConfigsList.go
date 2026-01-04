package botconfigs

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ConfigsList 获取所有配置列表
func ConfigsList(ctx *gin.Context) {
	// 从数据库读取所有 bot 配置
	configs, err := dao.ListBotConfigs()
	if err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.ErrReadConfigCatFailed)
		return
	}

	response.ResponseSuccess(ctx, configs)
}
