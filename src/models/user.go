package models

type User struct {
	Identity                 string `json:"identity" binding:"required"`
	UserName                 string `json:"username" binding:"required"`
	PassWord                 string `json:"password" binding:"required"`
	MasterName               string `json:"mastername"`
	Email                    string `json:"email"`
	IsEmailVerified          bool   `json:"is_email_verified"`
	ReceiveEmailNotification bool   `json:"receive_email_notification"`
}
