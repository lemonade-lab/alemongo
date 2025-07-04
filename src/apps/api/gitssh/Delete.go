package gitssh

import (
	"alemongo/src/paths"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// shh 列表
func Delete(ctx *gin.Context) {

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
	if err := os.Remove(filePath); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "删除失败",
			"data": nil,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "删除成功",
		"data": nil,
	})
}
