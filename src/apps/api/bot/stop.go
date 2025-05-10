package bot

import (
	"alemongo/src/core/alemonjs"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 停止指定名机器人
func Stop(ctx *gin.Context) {
	name := ctx.PostForm("name")
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
	// 停止机器人
	msg, err := alemonjs.Stop(name)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  msg,
			"data": nil,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": msg,
	})
}
