package botpackages

import (
	config "alemongo/src/paths"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func PackagesInfo(ctx *gin.Context) {
	botName := ctx.PostForm("name")
	appName := ctx.PostForm("app_name")
	if botName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
			"data": nil,
		})
		return
	}
	if !config.Exists(botName) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人不存在",
			"data": nil,
		})
		return
	}

	packagesPath := config.GetBotPackagesPath(botName)

	if _, err := os.Stat(packagesPath); os.IsNotExist(err) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "应用不存在",
			"data": nil,
		})
		return
	}

	data, err := GetPackageInfo(botName, appName)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "读取应用配置失败",
			"data": nil,
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "获取成功",
		"data": data,
	})
}
