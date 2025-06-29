package models

type User struct {
	Identity                 string `form:"identity" json:"identity" binding:"required"`
	UserName                 string `form:"username" json:"username" binding:"required"`
	PassWord                 string `form:"password" json:"password" binding:"required"`
	MasterName               string `form:"mastername" json:"mastername"`
	Email                    string `form:"email" json:"email"`
	IsEmailVerified          bool   `form:"is_email_verified" json:"is_email_verified"`
	ReceiveEmailNotification bool   `form:"receive_email_notification" json:"receive_email_notification"`
}
