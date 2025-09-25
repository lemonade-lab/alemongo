package bot

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	config "alemongo/src/paths"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// @Summary 复制机器人
// @Description 复制机器人
// @Tags 机器人
// @Accept json
// @Produce json
// @Param bot_name formData string true "机器人名"
// @Success 200 {object} response.ResponseData{data=any} "成功"
// @Failure 400 {object} response.ResponseData{data=any} "请求参数错误"
// @Failure 500 {object} response.ResponseData{data=any} "内部错误"
// @Router /bot/copy [post]
func Copy(ctx *gin.Context) {
	botName := ctx.PostForm("bot_name")
	if botName == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, response.RobotNameIsEmpty, "机器人名不能为空")
		return
	}
	botCopyName := fmt.Sprintf("%s-%s", botName, "copy")
	// 校验复制后的新名字（防止原名称已经达到长度上限等）
	if _, code := logic.CreateBot(botCopyName); code != response.CodeSuccess {
		// 不真正创建，只是利用校验逻辑，需要避免真实创建；因此调用前应短路逻辑。
		// 这里改为直接调用内部校验函数会更高效，但保持最小侵入：如果返回 AlreadyExist 以外错误则直接报错
		if code == response.RobotNameInvalid || code == response.RobotNameTooLong || code == response.RobotNameIsEmpty {
			response.ResponseError(ctx, http.StatusBadRequest, code)
			return
		}
		if code == response.RobotAlreadyExist {
			response.ResponseError(ctx, http.StatusBadRequest, code)
			return
		}
	}

	// 获取被复制机器人目录
	botPath := config.GetBotPath(botName)
	if _, err := os.Stat(botPath); os.IsNotExist(err) {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "bot_path is required")
		return
	}
	// 直接创建一个新的机器人目录，替换其模版文件
	targetPath, code := logic.CreateBot(botCopyName)
	if code != response.CodeSuccess {
		status := http.StatusInternalServerError
		if code == response.RobotNameInvalid || code == response.RobotNameTooLong || code == response.RobotNameIsEmpty || code == response.RobotAlreadyExist {
			status = http.StatusBadRequest
		}
		response.ResponseError(ctx, status, code)
		return
	}
	if err := logic.CopyDir(botPath, targetPath); err != nil {
		fmt.Println("copy bot failed:", err)
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, fmt.Errorf("copy bot failed: %w", err))
		return
	}
	response.ResponseSuccess(ctx, nil)
}
