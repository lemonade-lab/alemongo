package settings

import (
	"github.com/gin-gonic/gin"
)

// 开机自启
func PowerBoot(ctx *gin.Context) {
	checked := ctx.Query("checked")
	// 取值 0 则 不启动
	if checked == "0" {
		ctx.JSON(200, gin.H{
			"code": 200,
			"msg":  "取消注册",
			"data": nil,
		})
		return
	}
	// 取值 1 则 启动
	if checked == "1" {
		ctx.JSON(200, gin.H{
			"code": 200,
			"msg":  "注册成功",
			"data": nil,
		})
		return
	}
	ctx.JSON(200, gin.H{
		"code": 200,
		"msg":  "注册失败",
		"data": nil,
	})
}
