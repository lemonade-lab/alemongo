package models

type User struct {
	Identity                 string `form:"identity" binding:"required"`
	UserName                 string `form:"username" binding:"required"`
	PassWord                 string `form:"password" binding:"required"`
	MasterName               string `form:"mastername"`
	Email                    string `form:"email"`
	IsEmailVerified          bool   `form:"is_email_verified"`
	ReceiveEmailNotification bool   `form:"receive_email_notification"`
}
