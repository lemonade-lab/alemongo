package models

type User struct {
	Identity                 string `json:"identity" form:"identity" binding:"required"`
	UserName                 string `json:"username" form:"username" binding:"required"`
	PassWord                 string `json:"password" form:"password" binding:"required"`
	MasterName               string `json:"mastername" form:"mastername"`
	Email                    string `json:"email" form:"email"`
	IsEmailVerified          bool   `json:"is_email_verified" form:"is_email_verified"`
	ReceiveEmailNotification bool   `json:"receive_email_notification" form:"receive_email_notification"`
}
