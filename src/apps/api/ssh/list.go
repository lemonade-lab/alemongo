package gitssh

import (
	"alemongo/src/utils"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

// shh 列表
func List(ctx *gin.Context) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "无法获取用户目录",
			"data": err,
		})
		return
	}
	sshPath := filepath.Join(homeDir, ".ssh")
	log.Println("sshPath:", sshPath)
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
