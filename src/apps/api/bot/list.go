package bot

import (
	"alemongo/src/alemonjs"
	"alemongo/src/config"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// 机器人列表
func List(ctx *gin.Context) {
	bots := []alemonjs.BotInfo{}
	resourcesPath := config.GetResourcesPath()
	file, err := os.Open(resourcesPath)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "打开列表失败",
		})
		return
	}
	defer file.Close()
	files, err := file.Readdir(-1)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "读取列表失败",
		})
		return
	}
	for _, f := range files {
		if f.IsDir() && f.Name() != "template" && f.Name() != "bin" {
			// 获取机器人的信息
			res, err := alemonjs.Info(f.Name())
			if err != nil {
				bots = append(bots, res.Data)
			} else {
				bots = append(bots, res.Data)
			}
		}
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": bots,
	})
}
