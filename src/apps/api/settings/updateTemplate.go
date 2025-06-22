package settings

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"alemongo/src/settings"
	"github.com/gin-gonic/gin"
	"net/http"
	"path"
)

// 用于替换旧版本的基础机器人模板
func ResetTemplate(ctx *gin.Context) {
	originPath := settings.GetBotTemplate()
	targetPath := settings.GetResourcesPath()

	if err := logic.ResetTemplate(path.Join(originPath, "bin"), path.Join(targetPath, "bin")); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
	}
	if err := logic.ResetTemplate(path.Join(originPath, "template"), path.Join(targetPath, "template")); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
	}
	response.ResponseSuccess(ctx, nil)
}
