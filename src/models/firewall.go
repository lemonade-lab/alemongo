package models

// FirewallStatusResponse 表示系统防火墙状态信息
type FirewallStatusResponse struct {
	OS                string   `json:"os"`
	PfctlInstalled    bool     `json:"pfctlInstalled"`
	PfEnabled         bool     `json:"pfEnabled"`
	Info              string   `json:"info"`         // pfctl -s info 输出（可能被截断）
	RulesPreview      string   `json:"rulesPreview"` // pfctl -sr 前几行，避免过长
	Error             string   `json:"error,omitempty"`
	Supported         bool     `json:"supported"`
	Backend           string   `json:"backend,omitempty"`
	UnsupportedReason string   `json:"unsupportedReason,omitempty"`
	NextActions       []string `json:"nextActions,omitempty"`
}

// FirewallPlanRequest 生成防火墙变更计划
// Action: enable|disable|reload|allow|block|list|remove
// 当 Action 为 allow/block 时需要 Port/Protocol
// 当 Action 为 remove 时优先使用 Fingerprint 查找已存在记录（推荐），若仅提供端口/协议/备注将无法精确匹配指纹（暂不支持反查）。
type FirewallPlanRequest struct {
	Action      string `json:"action"`                // enable|disable|reload|allow|block|list|remove
	Port        int    `json:"port,omitempty"`        // 端口（当 allow/block 时）
	Protocol    string `json:"protocol,omitempty"`    // tcp|udp（当 allow/block 时）
	Comment     string `json:"comment,omitempty"`     // 备注
	Fingerprint string `json:"fingerprint,omitempty"` // remove 时推荐提供

	Execute          bool     `json:"execute,omitempty"`
	CommandsOverride []string `json:"commandsOverride,omitempty"`
}

// FirewallPlanResponse 安装/变更计划响应
type FirewallPlanResponse struct {
	OS                string   `json:"os"`
	PlannedCommands   []string `json:"plannedCommands"`
	Executed          bool     `json:"executed"`
	Message           string   `json:"message"`
	TaskID            string   `json:"taskId,omitempty"`
	Supported         bool     `json:"supported"`
	Backend           string   `json:"backend,omitempty"`
	UnsupportedReason string   `json:"unsupportedReason,omitempty"`
	NextActions       []string `json:"nextActions,omitempty"`
	ExecutionErrors   []string `json:"executionErrors,omitempty"`
	Fingerprint       string   `json:"fingerprint,omitempty"`
	AlreadyExists     bool     `json:"alreadyExists,omitempty"`
}
