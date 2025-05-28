package bot

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/settings"
	"net/http"
	"os"
	"path"

	"github.com/gin-gonic/gin"
)

func ConfigsData(ctx *gin.Context) {
	name := ctx.PostForm("name")
	if name == "" {
		response.ResponseError(ctx, http.StatusBadRequest, response.ConfigNameIsEmpty)
		//ctx.JSON(http.StatusBadRequest, gin.H{
		//	"code": http.StatusBadRequest,
		//	"msg":  "配置名不能为空",
		//	"data": nil,
		//})
		return
	}
	// 配置路径
	configsPath := settings.GetConfigsPath()
	curPath := path.Join(configsPath, name+".yaml")
	// 读取数据
	data, err := os.ReadFile(curPath)
	if err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.ReadConfigFailed)
		//ctx.JSON(http.StatusInternalServerError, gin.H{
		//	"code": http.StatusInternalServerError,
		//	"msg":  "读取配置失败",
		//	"data": nil,
		//})
		return
	}
	// 返回字符串
	response.ResponseSuccess(ctx, string(data))
	//ctx.JSON(http.StatusOK, gin.H{
	//	"code": http.StatusOK,
	//	"msg":  "获取成功",
	//	"data": string(data),
	//})
}
