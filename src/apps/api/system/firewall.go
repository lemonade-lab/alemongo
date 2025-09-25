package system

import (
	"alemongo/src/apps/api/requests"
	"alemongo/src/apps/api/response"
	"alemongo/src/core/tasks"
	"alemongo/src/dao"
	"alemongo/src/dao/db"
	"alemongo/src/logic"
	"alemongo/src/models"
	fw "alemongo/src/pkgs/firewall"
	"net/http"
	"strings"

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

		// 执行阶段持久化 / 删除标记
		actionLower := strings.ToLower(req.Action)
		if actionLower == "allow" || actionLower == "block" {
			if resp.Fingerprint != "" && !resp.AlreadyExists {
				proto := fw.NormalizeProtocol(req.Protocol)
				comment := fw.SanitizeComment(req.Comment)
				rec := &db.FirewallRuleDO{
					Fingerprint:    resp.Fingerprint,
					Action:         actionLower,
					Backend:        resp.Backend,
					Port:           req.Port,
					Protocol:       proto,
					Comment:        comment,
					RawSpec:        req.Action + " " + proto + " " + comment,
					NormalizedSpec: actionLower + ":" + resp.Backend + ":" + proto + ":" + comment,
				}
				_ = dao.CreateFirewallRuleActive(rec)
			}
		} else if actionLower == "remove" {
			// remove: 需要指纹
			if req.Fingerprint == "" && resp.Fingerprint == "" {
				resp.Message = "未提供指纹，无法删除"
			} else {
				fp := req.Fingerprint
				if fp == "" {
					fp = resp.Fingerprint
				}
				user, _ := requests.GetUserName(c)
				_ = dao.MarkFirewallRuleRemoved(fp, user)
			}
		}
	}

	response.ResponseSuccess(c, resp)
}
