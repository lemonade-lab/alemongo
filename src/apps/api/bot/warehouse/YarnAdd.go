package botwarehouse

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"net/http"

	"github.com/gin-gonic/gin"
)

func YarnAdd(ctx *gin.Context) {
	name := ctx.PostForm("name")
	args := ctx.PostFormArray("args")
	msg, err := logic.BotYarnAdd(name, args)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	response.ResponseSuccessWithMsg(ctx, nil, msg)
}
