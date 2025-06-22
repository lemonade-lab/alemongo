package botenv

import (
	"alemongo/src/logic"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func Read(ctx *gin.Context) {
	name := ctx.PostForm("name")
	if name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
			"data": nil,
		})
		return
	}
	if !logic.Exists(name) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人不存在",
			"data": nil,
		})
		return
	}
	envPath := logic.GetBotEnvPath(name)
	if _, err := os.Stat(envPath); os.IsNotExist(err) {
		// 不存在。向该地址文件写入空内容
		err := os.WriteFile(envPath, []byte(""), 0644)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"code": http.StatusInternalServerError,
				"msg":  "创建环境文件失败",
				"data": err,
			})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{
			"code": http.StatusOK,
			"msg":  "环境文件不存在，已创建空文件",
			"data": "",
		})
		return
	}
	content, err := os.ReadFile(envPath)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "读取失败",
			"data": "",
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "读取成功",
		"data": string(content),
	})
}
