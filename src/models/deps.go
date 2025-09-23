package models

// DependencyName 受支持的依赖名称
type DependencyName string

const (
	DepChrome DependencyName = "chrome"
	DepGit    DependencyName = "git"
	DepNvm    DependencyName = "nvm"
	DepNode   DependencyName = "node"
)

// DepStatus 单个依赖检测结果与安装建议
type DepStatus struct {
	Name            string   `json:"name"`
	Installed       bool     `json:"installed"`
	Version         string   `json:"version,omitempty"`
	Path            string   `json:"path,omitempty"`
	Manager         string   `json:"manager,omitempty"` // apt/yum/dnf/apk/brew/unknown
	OS              string   `json:"os,omitempty"`      // linux/darwin/windows
	InstallCommands []string `json:"installCommands,omitempty"`
	Notes           []string `json:"notes,omitempty"`
	Errors          []string `json:"errors,omitempty"`
}

// DepCheckResponse 依赖检测响应
type DepCheckResponse struct {
	OS      string      `json:"os"`
	Manager string      `json:"manager"`
	Items   []DepStatus `json:"items"`
}

// DepInstallRequest 安装请求（默认仅生成命令，不执行）
type DepInstallRequest struct {
	Names       []string `json:"names"`
	Execute     bool     `json:"execute"`               // 强制执行（默认 false，需额外开关放行）
	UseNvm      bool     `json:"useNvm,omitempty"`      // 安装 node 时是否优先用 nvm
	NodeVersion string   `json:"nodeVersion,omitempty"` // 指定 node 版本，如 "lts" 或 "20"
	NvmVersion  string   `json:"nvmVersion,omitempty"`  // 指定 nvm 版本，如 "v0.39.7"
	// CommandsOverride 允许前端自定义编辑后的命令，用于执行阶段覆盖生成的计划
	// key 为依赖名称（如 "git"），value 为命令数组
	CommandsOverride map[string][]string `json:"commandsOverride,omitempty"`
}

// DepInstallResponse 安装计划或执行结果
type DepInstallResponse struct {
	OS              string              `json:"os"`
	Manager         string              `json:"manager"`
	PlannedCommands map[string][]string `json:"plannedCommands"`
	Executed        bool                `json:"executed"`
	Message         string              `json:"message"`
	TaskID          string              `json:"taskId,omitempty"`
}
