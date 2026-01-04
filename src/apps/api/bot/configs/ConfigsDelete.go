package botconfigs

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ConfigsDelete(ctx *gin.Context) {
	// form
	name := ctx.PostForm("name")
	if name == "" {
		response.ResponseError(ctx, http.StatusBadRequest, response.ConfigNameIsEmpty)
		return
	}

	// 检查配置是否存在
	exists, err := dao.BotConfigExists(name)
	if err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.DeleteConfigFileFailed)
		return
	}

	if !exists {
		response.ResponseError(ctx, http.StatusOK, response.ConfigFileIsDeleted)
		return
	}

	// 从数据库删除配置
	err = dao.DeleteBotConfig(name)
	if err != nil {
		response.ResponseError(ctx, http.StatusBadRequest, response.DeleteConfigFileFailed)
		return
	}

	// 删除成功
	response.ResponseSuccess(ctx, name)
}
