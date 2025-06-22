package bot

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"alemongo/src/models"
	"alemongo/src/settings"
	"alemongo/src/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func stringInSlice(target string, list []string) bool {
	for _, item := range list {
		if item == target {
			return true
		}
	}
	return false
}

// 机器人列表
func List(ctx *gin.Context) {
	resourcesPath := settings.GetResourcesPath()
	names, err := utils.GetDirNames(resourcesPath)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "获取列表失败")
		return
	}
	bots := []models.BotInfo{}

	disableNames := []string{"template", "bin", "alemonjs"}

	for _, name := range names {
		// 如果是禁用的机器人名，则跳过
		if stringInSlice(name, disableNames) {
			continue
		}
		// 获取机器人的信息
		res, err := logic.Info(name)
		if err != nil {
			bots = append(bots, res.Data)
		} else {
			bots = append(bots, res.Data)
		}
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": bots,
	})
}
