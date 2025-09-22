package common

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// GetSystemStats 获取系统统计信息
// @Summary 获取系统统计信息
// @Description 获取CPU使用率、内存使用率、磁盘空间等系统监控信息
// @Tags 公共
// @Accept json
// @Produce json
// @Success 200 {object} response.ResponseData{data=logic.SystemStats} "成功"
// @Failure 500 {object} response.ResponseData "服务器错误"
// @Router /common/monitor [get]
func GetSystemStats(ctx *gin.Context) {
	stats, err := logic.GetSystemStats()
	if err != nil {
		zap.L().Error("获取系统统计信息失败", zap.Error(err))
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "获取系统统计信息失败")
		return
	}

	response.ResponseSuccess(ctx, stats)
}
