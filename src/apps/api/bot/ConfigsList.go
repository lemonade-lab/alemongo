package bot

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/settings"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// 获得指定名机器人的信息
func ConfigsList(ctx *gin.Context) {
	// 获取配置路径
	configsPath := settings.GetConfigsPath()
	if _, err := os.Stat(configsPath); os.IsNotExist(err) {
		err := os.MkdirAll(configsPath, os.ModePerm)
		if err != nil {
			response.ResponseError(ctx, http.StatusBadRequest, response.ErrCreateConfigCatFailed)
			//ctx.JSON(http.StatusBadRequest, gin.H{
			//	"code": http.StatusBadRequest,
			//	"msg":  "创建配置目录失败",
			//	"data": nil,
			//})
			return
		}
	}
	// 读取所有 *.yaml 文件
	files, err := os.ReadDir(configsPath)
	if err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.ErrReadConfigCatFailed)
		//ctx.JSON(http.StatusInternalServerError, gin.H{
		//	"code": http.StatusInternalServerError,
		//	"msg":  "读取配置目录失败",
		//	"data": nil,
		//})
		return
	}
	configs := make([]string, 0)
	for _, file := range files {
		if file.IsDir() {
			continue
		}
		if path := file.Name(); path[len(path)-5:] == ".yaml" {
			// 去掉后缀
			name := path[:len(path)-5]
			configs = append(configs, name)
		}
	}
	response.ResponseSuccess(ctx, configs)
	//ctx.JSON(http.StatusOK, gin.H{
	//	"code": http.StatusOK,
	//	"msg":  "获取配置列表成功",
	//	"data": configs,
	//})
}
