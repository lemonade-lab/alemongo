package botconfig

import (
	"alemongo/src/apps/api/response"
	config "alemongo/src/paths"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func ConfigData(ctx *gin.Context) {
	name := ctx.PostForm("name")
	if name == "" {
		response.ResponseError(ctx, http.StatusBadRequest, response.RobotNameIsEmpty)
		return
	}
	if !config.Exists(name) {
		response.ResponseError(ctx, http.StatusBadRequest, response.RobotNotExist)
		return
	}
	configPath := config.GetBotConfigPath(name)
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		response.ResponseError(ctx, http.StatusNotFound, response.RobotConfigNotExist)
		//ctx.JSON(http.StatusBadRequest, gin.H{
		//	"code": http.StatusBadRequest,
		//	"msg":  "机器人配置不存在",
		//	"data": nil,
		//})
		return
	}
	data, err := os.ReadFile(configPath)
	if err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.ReadRobotConfigFailed)
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
