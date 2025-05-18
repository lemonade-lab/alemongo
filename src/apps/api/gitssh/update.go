package gitssh

import (
	"net/http"
	"os"
	"path"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

// shh 列表
func Update(ctx *gin.Context) {
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
	// 更新指定文件内容
	fileName := ctx.PostForm("name")
	if fileName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "文件名不能为空",
			"data": nil,
		})
		return
	}
	filePath := path.Join(sshPath, fileName)
	content := ctx.PostForm("content")
	if content == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "文件内容不能为空",
			"data": nil,
		})
		return
	}
	if err := os.WriteFile(filePath, []byte(content), 0644); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "更新失败",
			"data": nil,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "更新成功",
		"data": nil,
	})
}
