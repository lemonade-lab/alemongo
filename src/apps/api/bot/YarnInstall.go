package bot

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"net/http"

	"github.com/gin-gonic/gin"
)

func YarnInstall(ctx *gin.Context) {
	name := ctx.PostForm("name")
	msg, err := logic.BotYarnInstall(name)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	response.ResponseSuccessWithMsg(ctx, err, msg)
}
