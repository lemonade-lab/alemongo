package bot

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// 获得指定名机器人的信息
func ConfigUpdate(ctx *gin.Context) {
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
		response.ResponseError(ctx, http.StatusBadRequest, response.RobotConfigNotExist)
		//ctx.JSON(http.StatusBadRequest, gin.H{
		//	"code": http.StatusBadRequest,
		//	"msg":  "机器人配置不存在",
		//	"data": nil,
		//})
		return
	}
	content := ctx.PostForm("content")
	// 把数据写入该文件
	err := os.WriteFile(configPath, []byte(content), 0644)
	if err != nil {
		response.ResponseError(ctx, http.StatusBadRequest, response.CreateConfigFailed)
		//ctx.JSON(http.StatusBadRequest, gin.H{
		//	"code": http.StatusBadRequest,
		//	"msg":  "配置失败",
		//	"data": nil,
		//})
		return
	}
	response.ResponseSuccess(ctx, nil)
	//ctx.JSON(http.StatusOK, gin.H{
	//	"code": http.StatusOK,
	//	"msg":  "配置成功",
	//	"data": nil,
	//})
}
