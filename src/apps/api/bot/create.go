package bot

import (
	"alemongo/src/config"
	"net/http"
	"os"
	"path"

	"github.com/gin-gonic/gin"
	"github.com/otiai10/copy"
)

// 创建机器人
func Create(ctx *gin.Context) {
	// 获得表单数据
	name := ctx.PostForm("name")
	if name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
			"data": nil,
		})
	}
	// 资源路径
	resourcesPath := config.GetResourcesPath()
	// 目标路径
	targetPath := path.Join(resourcesPath, name)
	// 检查是否存在目录 ./resources/{name}
	if _, err := os.Stat(targetPath); err == nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人已存在",
			"data": targetPath,
		})
		return
	}
	// 创建目录 ./resources/{name}
	if err := os.MkdirAll(targetPath, 0755); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "创建机器人失败",
			"data": targetPath,
		})
		return
	}
	// 模板路径
	templatePath := path.Join(resourcesPath, "template")
	// 复制文件 /resources/template 复制到 /resources/{name}
	if err := copy.Copy(templatePath, targetPath); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "创建机器人失败",
			"data": targetPath,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "机器人创建成功",
		"data": targetPath,
	})
}
