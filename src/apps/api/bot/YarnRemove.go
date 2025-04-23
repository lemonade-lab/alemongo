package bot

import (
	"alemongo/src/alemonjs"
	"alemongo/src/alemonjs/yarn"
	"net/http"

	"github.com/gin-gonic/gin"
)

func YarnRemove(ctx *gin.Context) {
	name := ctx.PostForm("name")
	args := ctx.PostFormArray("args")
	if name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
			"data": nil,
		})
		return
	}
	if !alemonjs.Exists(name) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人不存在",
			"data": nil,
		})
		return
	}
	msg, err := yarn.Remove(name, args)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  msg,
			"data": err,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  msg,
		"data": nil,
	})
}
