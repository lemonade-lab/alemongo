package settings

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"alemongo/src/settings"
	"alemongo/src/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

// 用于替换旧版本的基础机器人模板
func ResetTemplate(ctx *gin.Context) {
	targetPath := settings.GetResourcesPath()

	if err := logic.ResetTemplate(utils.ResourcesFS, targetPath); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
	}
	response.ResponseSuccess(ctx, nil)
}
