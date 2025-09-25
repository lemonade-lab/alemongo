package firewall

// 统一的防火墙抽象层：对上层隐藏平台差异。
// 当前仅实现 macOS (pfctl)。Linux/Windows 以 unsupported stub 形式返回。

// Status 描述基础防火墙状态信息（与对外 models 有交集，但保持内部独立，方便演进）。
type Status struct {
	OS                string
	Backend           string
	PfctlInstalled    bool   // 仅 pf backend 有意义
	PfEnabled         bool   // 仅 pf backend 有意义
	Info              string // 精简 info 输出
	RulesPreview      string // 规则预览
	Error             string // 人类可读错误
	Supported         bool
	UnsupportedReason string // 机器可读原因码: platform_unsupported | missing_binary
	NextActions       []string
}

// PlanRequest 规划/命令生成输入
type PlanRequest struct {
	Action           string
	Port             int
	Protocol         string
	Comment          string
	Fingerprint      string // remove 动作指纹匹配
	CommandsOverride []string
}

// Plan 规划结果
type Plan struct {
	OS                string
	Backend           string
	PlannedCommands   []string
	Executed          bool
	Message           string
	Supported         bool
	UnsupportedReason string
	NextActions       []string
	ExecutionErrors   []string // 若执行阶段（未来扩展）发生错误的收集
	Fingerprint       string   // 规则指纹（allow/block 且含端口时生成）
	AlreadyExists     bool     // 判重标记（依赖外部持久化）
}

// Provider 平台适配器接口
type Provider interface {
	Backend() string
	Supported() bool
	Status() (*Status, error)
	Plan(req PlanRequest) (*Plan, error)
}

// New 根据当前操作系统返回对应 Provider。
// 具体实现由带 build tag 的文件提供。
func New() Provider {
	return newProvider()
}
