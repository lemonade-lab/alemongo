package bot

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// GetProcessPorts 获取进程占用的端口信息
// @Summary 获取进程占用的端口信息
// @Description 根据进程ID获取该进程占用的所有端口信息
// @Tags 机器人管理
// @Accept json
// @Produce json
// @Param pid path int true "进程ID"
// @Success 200 {object} response.ResponseData{data=models.ProcessPortInfo} "成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 500 {object} response.ResponseData "服务器错误"
// @Router /bot/process/{pid}/ports [get]
func GetProcessPorts(ctx *gin.Context) {
	pidStr := ctx.Param("pid")
	if pidStr == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "进程ID不能为空")
		return
	}

	pid, err := strconv.Atoi(pidStr)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "无效的进程ID")
		return
	}

	portInfo, err := logic.GetProcessPorts(pid)
	if err != nil {
		zap.L().Error("获取进程端口信息失败", zap.Error(err))
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "获取进程端口信息失败")
		return
	}

	response.ResponseSuccess(ctx, portInfo)
}
