package bot

import (
	"alemongo/src/alemonjs"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// 获得指定名机器人的信息
func Config(ctx *gin.Context) {
	name := ctx.PostForm("name")
	if name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
			"data": nil,
		})
		return
	}
	if !alemonjs.Exists(name) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人不存在",
			"data": nil,
		})
		return
	}
	// 获取当前的机器人独立配置。
	botPath := alemonjs.GetBotPath(name)
	// 判断是否存在配置文件
	if !alemonjs.Exists(botPath) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "配置文件不存在",
			"data": nil,
		})
		return
	}
	// 配置地址
	configPath := alemonjs.GetBotConfigPath(name)
	// io 读取配置文件。不解析。直接丢字符串。
	pidData, err := ioutil.ReadFile(configPath)
	if os.IsNotExist(err) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "配置文件不存在",
			"data": "",
		})
		return
	} else if err == nil {
		ctx.JSON(http.StatusOK, gin.H{
			"code": http.StatusOK,
			"msg":  "请求成功",
			"data": string(pidData),
		})
		return
	} else {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "读取配置文件失败",
			"data": "",
		})
		return
	}
}
