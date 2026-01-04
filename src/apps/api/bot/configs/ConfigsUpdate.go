package botconfigs

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ConfigsUpdate(ctx *gin.Context) {
	name := ctx.PostForm("name")
	if name == "" {
		response.ResponseError(ctx, http.StatusBadRequest, response.ConfigNameIsEmpty)
		return
	}
	content := ctx.PostForm("content")
	if content == "" {
		response.ResponseError(ctx, http.StatusBadRequest, response.ConfigContentIsEmpty)
		return
	}

	// 保存到数据库
	err := dao.UpsertBotConfig(name, content)
	if err != nil {
		response.ResponseError(ctx, http.StatusBadRequest, response.CreateConfigFailed)
		return
	}

	response.ResponseSuccess(ctx, name)
}
