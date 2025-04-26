package bot

import (
	"alemongo/src/config"
	"net/http"
	"os"
	"path"

	"github.com/gin-gonic/gin"
)

// 获得指定名机器人的信息
func ConfigsCreate(ctx *gin.Context) {
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
	// 配置路径
	configsPath := config.GetConfigsPath()
	curPath := path.Join(configsPath, name+".yaml")
	// 把数据写入该文件
	err := os.WriteFile(curPath, []byte(content), 0644)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "创建配置失败",
			"data": nil,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "创建配置成功",
		"data": curPath,
	})
}
