package bot

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
)

func ConfigData(ctx *gin.Context) {
	name := ctx.PostForm("name")
	if name == "" {
		response.ResponseError(ctx, http.StatusBadRequest, response.RobotNameIsEmpty)
		//ctx.JSON(http.StatusBadRequest, gin.H{
		//	"code": http.StatusBadRequest,
		//	"msg":  "机器人名不能为空",
		//	"data": nil,
		//})
		return
	}
	if !logic.Exists(name) {
		response.ResponseError(ctx, http.StatusBadRequest, response.RobotNotExist)
		//ctx.JSON(http.StatusBadRequest, gin.H{
		//	"code": http.StatusBadRequest,
		//	"msg":  "机器人不存在",
		//	"data": nil,
		//})
		return
	}
	configPath := logic.GetBotConfigPath(name)
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
