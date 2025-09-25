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
		return
	}

	targetPath, err := logic.CreateBot(name)
	if err != response.CodeSuccess {
		status := http.StatusInternalServerError
		if err == response.RobotNameInvalid || err == response.RobotNameTooLong || err == response.RobotNameIsEmpty || err == response.RobotAlreadyExist {
			status = http.StatusBadRequest
		}
		response.ResponseError(ctx, status, err)
		return
	}

	response.ResponseSuccess(ctx, targetPath)
}
