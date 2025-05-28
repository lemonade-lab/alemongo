package models

type User struct {
	Identity                 string `json:"identity"`
	UserName                 string `json:"username"`
	PassWord                 string `json:"password"`
	MasterName               string `json:"mastername"`
	Email                    string `json:"email"`
	IsEmailVerified          bool   `json:"is_email_verified"`
	ReceiveEmailNotification bool   `json:"receive_email_notification"`
}
