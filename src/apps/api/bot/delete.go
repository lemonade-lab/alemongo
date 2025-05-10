package bot

import (
	"alemongo/src/core/alemonjs"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// method: DELETE
// 删除指定名机器人
func Delete(ctx *gin.Context) {
	name := ctx.Query("name")
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
	// 看看是不是在运行。在运行要就要停止
	if alemonjs.IsRunning(name) {
		msg, err := alemonjs.Stop(name)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"code": http.StatusBadRequest,
				"msg":  msg,
				"data": nil,
			})
			return
		}
	}
	botPath := alemonjs.GetBotPath(name)
	// 删除目录
	if err := os.RemoveAll(botPath); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "删除机器人失败",
			"data": botPath,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "机器人删除成功",
		"data": botPath,
	})
}
