package models

type EmailConfig struct {
	Provider   string `form:"provider"`   // 服务提供商，如QQ
	Host       string `form:"host"`       // 服务器
	Port       int64  `form:"port"`       // 端口
	Username   string `form:"username"`   // 发送方邮箱
	Password   string `form:"password"`   // 授权码
	From_email string `form:"from_email"` // 发送方邮箱
}
