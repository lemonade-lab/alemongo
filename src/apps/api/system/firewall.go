package system

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/core/tasks"
	"alemongo/src/logic"
	"alemongo/src/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GET /system/firewall/status
// @Summary 获取防火墙状态（macOS PF）
// @Tags 系统
// @Produce json
// @Success 200 {object} response.ResponseData{data=models.FirewallStatusResponse}
// @Router /system/firewall/status [get]
func GetFirewallStatus(c *gin.Context) {
	res := logic.FirewallStatus()
	response.ResponseSuccess(c, res)
}

// POST /system/firewall/plan
// @Summary 生成防火墙变更计划（可选择执行）
// @Tags 系统
// @Accept json
// @Produce json
// @Param body body models.FirewallPlanRequest true "防火墙计划请求"
// @Success 200 {object} response.ResponseData{data=models.FirewallPlanResponse}
// @Failure 400 {object} response.ResponseData
// @Router /system/firewall/plan [post]
func PlanFirewall(c *gin.Context) {
	var req models.FirewallPlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "参数错误")
		return
	}

	resp := logic.FirewallPlan(req)

	if req.Execute {
		commands := req.CommandsOverride
		if len(commands) == 0 {
			commands = resp.PlannedCommands
		}
		if len(commands) == 0 {
			response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "无可执行命令")
			return
		}
		t := tasks.Default().CreateTask("firewall", commands)
		resp.Executed = true
		resp.TaskID = t.ID
		resp.Message = "防火墙任务已创建，前往任务中心查看"
	}

	response.ResponseSuccess(c, resp)
}
