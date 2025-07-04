package gitssh

import (
	"alemongo/src/paths"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func Read(ctx *gin.Context) {
	fileName := ctx.Query("name")
	if fileName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "文件名不能为空",
			"data": nil,
		})
		return
	}
	filePath, err := paths.GetSSHAuthPathByName(fileName)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "获取文件路径失败",
			"data": nil,
		})
	}
	content, err := os.ReadFile(filePath)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "读取失败",
			"data": nil,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "读取成功",
		"data": string(content),
	})
}
