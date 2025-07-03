package settings

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"alemongo/src/paths"
	"alemongo/src/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 用于替换旧版本的基础机器人模板
func ResetTemplate(ctx *gin.Context) {
	targetPath := paths.GetResourcesPath()

	if err := logic.ResetTemplate(utils.ResourcesFS, targetPath); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
	}
	response.ResponseSuccess(ctx, nil)
}
