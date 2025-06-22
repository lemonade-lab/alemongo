package models

type BotInfo struct {
	Name        string `json:"name"`         // 机器人名
	Status      int    `json:"status"`       // 0: 未运行, 1: 运行中
	Pid         int    `json:"pid"`          // 进程ID
	NodeModules bool   `json:"node_modules"` // 是否安装依赖
	CreateAt    string `json:"create_at"`    // 创建时间
}

type BotInfoResponse struct {
	Code int     `json:"code"`
	Msg  string  `json:"msg"`
	Data BotInfo `json:"data"`
}
