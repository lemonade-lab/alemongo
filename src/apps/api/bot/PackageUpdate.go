package bot

import (
	"alemongo/src/core/alemonjs"
	"net/http"
	"os"
	"path"

	"github.com/gin-gonic/gin"
)

func PackageUpdate(ctx *gin.Context) {
	name := ctx.PostForm("name")
	if name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "配置名不能为空",
			"data": nil,
		})
		return
	}
	content := ctx.PostForm("content")
	if content == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "配置内容不能为空",
			"data": nil,
		})
		return
	}
	botPath := alemonjs.GetBotPath(name)
	pkgPath := path.Join(botPath, "package.json")
	// 把数据写入该文件
	err := os.WriteFile(pkgPath, []byte(content), 0644)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "配置失败",
			"data": nil,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "配置成功",
		"data": pkgPath,
	})
}
