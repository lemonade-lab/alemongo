package common

// ToolInfo 定义工具信息结构体
type ToolInfo struct {
	Installed bool   `json:"installed"`
	Version   string `json:"version"`
}

// InfoResponse 定义响应数据结构体
type InfoResponse struct {
	NVM      ToolInfo `json:"nvm"`
	Node     ToolInfo `json:"node"`
	Browser  ToolInfo `json:"browser"`
	Git      ToolInfo `json:"git"`
	StartAt  string   `json:"start_at"`
	Location string   `json:"location"`
}
