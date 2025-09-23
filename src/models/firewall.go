package models

// FirewallStatusResponse 表示系统防火墙状态信息
type FirewallStatusResponse struct {
	OS             string `json:"os"`
	PfctlInstalled bool   `json:"pfctlInstalled"`
	PfEnabled      bool   `json:"pfEnabled"`
	Info           string `json:"info"`         // pfctl -s info 输出（可能被截断）
	RulesPreview   string `json:"rulesPreview"` // pfctl -sr 前几行，避免过长
	Error          string `json:"error,omitempty"`
}

// FirewallPlanRequest 生成防火墙变更计划
// Action: enable|disable|reload|allow|block
// 当 Action 为 allow/block 时需要 Port/Protocol
type FirewallPlanRequest struct {
	Action   string `json:"action"`             // enable|disable|reload|allow|block
	Port     int    `json:"port,omitempty"`     // 端口（当 allow/block 时）
	Protocol string `json:"protocol,omitempty"` // tcp|udp（当 allow/block 时）
	Comment  string `json:"comment,omitempty"`  // 备注

	Execute          bool     `json:"execute,omitempty"`
	CommandsOverride []string `json:"commandsOverride,omitempty"`
}

// FirewallPlanResponse 安装/变更计划响应
type FirewallPlanResponse struct {
	OS              string   `json:"os"`
	PlannedCommands []string `json:"plannedCommands"`
	Executed        bool     `json:"executed"`
	Message         string   `json:"message"`
	TaskID          string   `json:"taskId,omitempty"`
}
