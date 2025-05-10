package bot

import (
	"alemongo/src/core/alemonjs"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 获得指定名机器人的信息
func Info(ctx *gin.Context) {
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
	res, err := alemonjs.Info(name)
	if err != nil {
		ctx.JSON(http.StatusOK, gin.H{
			"code": http.StatusOK,
			"msg":  "请求成功",
			"data": res.Data,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": res.Data,
	})
}
