package bot

import (
	"alemongo/src/config"
	"net/http"
	"os"
	"path"

	"github.com/gin-gonic/gin"
)

func ConfigsData(ctx *gin.Context) {
	name := ctx.PostForm("name")
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
	// 读取数据
	data, err := os.ReadFile(curPath)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "读取配置失败",
			"data": nil,
		})
		return
	}
	// 返回字符串
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "获取成功",
		"data": string(data),
	})
}
