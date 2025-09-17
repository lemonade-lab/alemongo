package bot

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	config "alemongo/src/paths"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
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
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "bot_name is required")
		return
	}
	botCopyName := fmt.Sprintf("%s-%s", botName, "copy")
	// 获取被复制机器人目录
	botPath := config.GetBotPath(botName)
	if _, err := os.Stat(botPath); os.IsNotExist(err) {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "bot_path is required")
		return
	}
	// 直接创建一个新的机器人目录，替换其模版文件
	targetPath, err := logic.CreateBot(botCopyName)
	if err != response.CodeSuccess {
		response.ResponseError(ctx, http.StatusInternalServerError, err)
		return
	}
	if err := logic.CopyDir(botPath, targetPath); err != nil {
		fmt.Println("copy bot failed:", err)
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, fmt.Errorf("copy bot failed: %w", err))
		return
	}
	response.ResponseSuccess(ctx, nil)
}
