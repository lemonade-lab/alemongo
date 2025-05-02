package bot

import (
	"alemongo/src/config"
	"net/http"
	"os"
	"path"

	"github.com/gin-gonic/gin"
)

func ConfigsDelete(ctx *gin.Context) {
	name := ctx.Query("name")
	if name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "配置名不能为空",
			"data": nil,
		})
		return
	}
	// 配置路径
	configsPath := config.GetConfigsPath()
	curPath := path.Join(configsPath, name+".yaml")
	// 判断是否存在。
	if _, err := os.Stat(curPath); os.IsNotExist(err) {
		ctx.JSON(http.StatusOK, gin.H{
			"code": http.StatusOK,
			"msg":  "已被删除",
			"data": nil,
		})
		return
	}
	// 删除文件
	err := os.Remove(curPath)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "删除配置失败",
			"data": nil,
		})
		return
	}
	// 删除成功
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "配置成功",
		"data": curPath,
	})
}
