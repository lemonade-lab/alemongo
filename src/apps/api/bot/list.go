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

// 机器人列表
func List(ctx *gin.Context) {
	resourcesPath := settings.GetResourcesPath()
	names, err := utils.GetDirNames(resourcesPath)
	//fmt.Println("bots names: ", names)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "获取列表失败")
		return
	}
	bots := []models.BotInfo{}
	for _, name := range names {
		if name != "template" && name != "bin" {
			// 获取机器人的信息
			res, err := logic.Info(name)
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
