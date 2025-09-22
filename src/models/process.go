package models

// ProcessPortInfo 进程端口信息
type ProcessPortInfo struct {
	PID   int        `json:"pid"`             // 进程ID
	Ports []PortInfo `json:"ports"`           // 端口列表
	Error string     `json:"error,omitempty"` // 错误信息
}

// PortInfo 端口信息
type PortInfo struct {
	Protocol string `json:"protocol"` // 协议类型 (TCP/UDP)
	Local    string `json:"local"`    // 本地地址:端口
	Remote   string `json:"remote"`   // 远程地址:端口
	State    string `json:"state"`    // 连接状态
	PID      string `json:"pid"`      // 进程ID
}
