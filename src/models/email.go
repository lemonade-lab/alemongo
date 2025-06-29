package models

type EmailConfig struct {
	Provider   string `form:"provider" json:"provider"`     // 服务提供商，如QQ
	Host       string `form:"host" json:"host"`             // 服务器
	Port       int64  `form:"port" json:"port"`             // 端口
	Username   string `form:"username" json:"username"`     // 发送方邮箱
	Password   string `form:"password" json:"password"`     // 授权码
	From_email string `form:"from_email" json:"from_email"` // 发送方邮箱
}
