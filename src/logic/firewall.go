package logic

import (
	"alemongo/src/dao"
	"alemongo/src/models"
	fw "alemongo/src/pkgs/firewall"
)

// FirewallStatus 使用统一防火墙抽象获取状态
func FirewallStatus() models.FirewallStatusResponse {
	p := fw.New()
	st, _ := p.Status()
	if st == nil {
		st = &fw.Status{}
	}
	return models.FirewallStatusResponse{
		OS:                st.OS,
		PfctlInstalled:    st.PfctlInstalled,
		PfEnabled:         st.PfEnabled,
		Info:              st.Info,
		RulesPreview:      st.RulesPreview,
		Error:             st.Error,
		Supported:         st.Supported,
		Backend:           st.Backend,
		UnsupportedReason: st.UnsupportedReason,
		NextActions:       st.NextActions,
	}
}

// FirewallPlan 使用统一防火墙抽象生成命令计划
func FirewallPlan(req models.FirewallPlanRequest) models.FirewallPlanResponse {
	p := fw.New()
	planReq := fw.PlanRequest{
		Action:           req.Action,
		Port:             req.Port,
		Protocol:         req.Protocol,
		Comment:          req.Comment,
		Fingerprint:      req.Fingerprint,
		CommandsOverride: req.CommandsOverride,
	}
	plan, _ := p.Plan(planReq)
	if plan == nil {
		plan = &fw.Plan{}
	}
	// 指纹判重（allow/block 且端口>0 时）
	if plan.Fingerprint != "" {
		if rec, err := dao.GetFirewallRuleByFingerprint(plan.Fingerprint); err == nil && rec != nil {
			plan.AlreadyExists = true
		}
	}
	// remove 动作：若请求未提供指纹且计划中无指纹，不做额外处理
	return models.FirewallPlanResponse{
		OS:                plan.OS,
		PlannedCommands:   plan.PlannedCommands,
		Executed:          plan.Executed,
		Message:           plan.Message,
		Supported:         plan.Supported,
		Backend:           plan.Backend,
		UnsupportedReason: plan.UnsupportedReason,
		NextActions:       plan.NextActions,
		ExecutionErrors:   plan.ExecutionErrors,
		Fingerprint:       plan.Fingerprint,
		AlreadyExists:     plan.AlreadyExists,
	}
}

// BuildFirewallCommandsForPort helper for tests (保持兼容)
func BuildFirewallCommandsForPort(action string, port int, protocol string, comment string) []string {
	resp := FirewallPlan(models.FirewallPlanRequest{Action: action, Port: port, Protocol: protocol, Comment: comment})
	return resp.PlannedCommands
}
