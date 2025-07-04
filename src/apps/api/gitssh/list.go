package gitssh

import (
	"alemongo/src/paths"
	"alemongo/src/utils"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// shh 列表
func List(ctx *gin.Context) {
	sshPath, err := paths.GetSSHPath()
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "获取 SSH 目录失败",
			"data": err,
		})
		return
	}
	// 检查目录
	if _, err := os.Stat(sshPath); os.IsNotExist(err) {
		ctx.JSON(http.StatusOK, gin.H{
			"code": http.StatusOK,
			"msg":  "目录不存在",
			"data": []string{},
		})
		return
	}
	names, err := utils.GetFileNames(sshPath)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "获取列表失败",
			"data": err,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": names,
	})
}
