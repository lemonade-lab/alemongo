package gitssh

import (
	"alemongo/src/paths"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func Update(ctx *gin.Context) {
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
	filePath, err := paths.GetSSHAuthPathByName(fileName)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "获取文件路径失败",
			"data": nil,
		})
	}
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
