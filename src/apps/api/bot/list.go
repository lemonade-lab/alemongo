package bot

import (
	"alemongo/src/core/alemonjs"
	"alemongo/src/settings"
	"alemongo/src/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 机器人列表
func List(ctx *gin.Context) {
	resourcesPath := settings.GetResourcesPath()
	names, err := utils.GetDirNames(resourcesPath)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "获取列表失败",
		})
		return
	}
	bots := []alemonjs.BotInfo{}
	for _, name := range names {
		if name != "template" && name != "bin" {
			// 获取机器人的信息
			res, err := alemonjs.Info(name)
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
