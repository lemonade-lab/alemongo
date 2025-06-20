package settings

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"alemongo/src/settings"
	"github.com/gin-gonic/gin"
	"net/http"
)

// 用于替换旧版本的基础机器人模板
func ResetTemplate(ctx *gin.Context) {
	originPath := settings.GetBotTemplate()
	targetPath := settings.GetResourcesPath()

	if err := logic.ResetTemplate(originPath, targetPath); err != nil {
		response.ResponseError(ctx, http.StatusBadRequest, http.StatusBadRequest)
	}
	response.ResponseSuccess(ctx, nil)
}
