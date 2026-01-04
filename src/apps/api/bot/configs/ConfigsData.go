package botconfigs

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ConfigsData(ctx *gin.Context) {
	name := ctx.PostForm("name")
	if name == "" {
		response.ResponseError(ctx, http.StatusBadRequest, response.ConfigNameIsEmpty)
		return
	}

	// 从数据库读取配置数据
	data, err := dao.GetBotConfig(name)
	if err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.ReadConfigFailed)
		return
	}

	// 如果配置不存在，返回空字符串
	if data == "" {
		response.ResponseError(ctx, http.StatusNotFound, response.ReadConfigFailed)
		return
	}

	// 返回字符串
	response.ResponseSuccess(ctx, data)
}
