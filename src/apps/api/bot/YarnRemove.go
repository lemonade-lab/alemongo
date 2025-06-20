package bot

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"net/http"

	"github.com/gin-gonic/gin"
)

func YarnRemove(ctx *gin.Context) {
	name := ctx.PostForm("name")
	args := ctx.PostFormArray("args")
	msg, err := logic.BotYarnRemove(name, args)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	response.ResponseSuccessWithMsg(ctx, nil, msg)
}
