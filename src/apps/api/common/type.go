package common

// ToolInfo 定义工具信息结构体
type ToolInfo struct {
	Installed bool   `json:"installed"`
	Version   string `json:"version"`
}

type BaseInfo struct {
	Version   string `json:"version"`    // 版本号
	BuildTime string `json:"build_time"` // 构建时间
}

// InfoResponse 定义响应数据结构体
type InfoResponse struct {
	NVM      ToolInfo `json:"nvm"`
	Node     ToolInfo `json:"node"`
	Browser  ToolInfo `json:"browser"`
	Git      ToolInfo `json:"git"`
	Base     BaseInfo `json:"base"`
	StartAt  string   `json:"start_at"`
	Location string   `json:"location"`
}
