package bot

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 创建机器人
func Create(ctx *gin.Context) {
	// 获得表单数据
	name := ctx.PostForm("name")
	if name == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, response.RobotNameIsEmpty, "机器人名不能为空")
	}

	targetPath, err := logic.CreateBot(name)
	if err != response.CodeSuccess {
		response.ResponseError(ctx, http.StatusInternalServerError, err)
		return
	}

	response.ResponseSuccess(ctx, targetPath)
}

// todo 创建群组机器人
func CreateBotGroup(c *gin.Context) {

}
