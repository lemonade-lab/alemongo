package portMonitor

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// GetAllPorts 获取所有端口信息
// @Summary 获取所有端口信息
// @Description 获取系统中所有被占用的端口信息
// @Tags 端口监控
// @Accept json
// @Produce json
// @Success 200 {object} response.ResponseData{data=[]models.PortInfo} "成功"
// @Failure 500 {object} response.ResponseData "服务器错误"
// @Router /port-monitor/ports [get]
func GetAllPorts(ctx *gin.Context) {
	ports, err := logic.GetAllPorts()
	if err != nil {
		zap.L().Error("获取端口信息失败", zap.Error(err))
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "获取端口信息失败")
		return
	}

	response.ResponseSuccess(ctx, ports)
}

// GetPortsByPort 根据端口号获取端口信息
// @Summary 根据端口号获取端口信息
// @Description 根据指定端口号获取相关的端口信息
// @Tags 端口监控
// @Accept json
// @Produce json
// @Param port path int true "端口号"
// @Success 200 {object} response.ResponseData{data=[]models.PortInfo} "成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 500 {object} response.ResponseData "服务器错误"
// @Router /port-monitor/ports/{port} [get]
func GetPortsByPort(ctx *gin.Context) {
	portStr := ctx.Param("port")
	if portStr == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "端口号不能为空")
		return
	}

	port, err := strconv.Atoi(portStr)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "无效的端口号")
		return
	}

	ports, err := logic.GetPortsByPort(port)
	if err != nil {
		zap.L().Error("获取端口信息失败", zap.Error(err))
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "获取端口信息失败")
		return
	}

	response.ResponseSuccess(ctx, ports)
}

// GetPortsByProcess 根据进程名获取端口信息
// @Summary 根据进程名获取端口信息
// @Description 根据指定进程名获取相关的端口信息
// @Tags 端口监控
// @Accept json
// @Produce json
// @Param process query string true "进程名"
// @Success 200 {object} response.ResponseData{data=[]models.PortInfo} "成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 500 {object} response.ResponseData "服务器错误"
// @Router /port-monitor/process [get]
func GetPortsByProcess(ctx *gin.Context) {
	processName := ctx.Query("process")
	if processName == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "进程名不能为空")
		return
	}

	ports, err := logic.GetPortsByProcess(processName)
	if err != nil {
		zap.L().Error("获取端口信息失败", zap.Error(err))
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "获取端口信息失败")
		return
	}

	response.ResponseSuccess(ctx, ports)
}
