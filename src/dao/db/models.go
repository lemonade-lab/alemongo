package db

import (
	"alemongo/src/models"
	"time"
)

// UserDO is the DB model for users table
// Using simple fields to map to models.User
// Password is stored as plain text for compatibility with existing logic (consider hashing later).

type UserDO struct {
	ID        uint `gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time

	Identity                 string `gorm:"size:64;index"`
	UserName                 string `gorm:"size:128;uniqueIndex"`
	PassWord                 string `gorm:"size:256"`
	MasterName               string `gorm:"size:128"`
	Email                    string `gorm:"size:256"`
	IsEmailVerified          bool
	ReceiveEmailNotification bool

	GitHubID       int64  `gorm:"index"`
	GitHubUsername string `gorm:"size:128"`
	GitHubAvatar   string `gorm:"size:512"`
	IsGitHubBound  bool

	// ExtraInfo is stored as JSON string (optional)
	ExtraInfoJSON string `gorm:"type:text"`
}

func (UserDO) TableName() string { return "users" }

func ToUserModel(do *UserDO) models.User {
	return models.User{
		Identity:                 do.Identity,
		UserName:                 do.UserName,
		PassWord:                 do.PassWord,
		MasterName:               do.MasterName,
		Email:                    do.Email,
		IsEmailVerified:          do.IsEmailVerified,
		ReceiveEmailNotification: do.ReceiveEmailNotification,
		GitHubID:                 do.GitHubID,
		GitHubUsername:           do.GitHubUsername,
		GitHubAvatar:             do.GitHubAvatar,
		IsGitHubBound:            do.IsGitHubBound,
		// ExtraInfo 在 DAO 层暂不回填（当前 models.User 为 map[string]interface{}，可后续引入 typed struct）
	}
}

func FromUserModel(m *models.User) *UserDO {
	return &UserDO{
		Identity:                 m.Identity,
		UserName:                 m.UserName,
		PassWord:                 m.PassWord,
		MasterName:               m.MasterName,
		Email:                    m.Email,
		IsEmailVerified:          m.IsEmailVerified,
		ReceiveEmailNotification: m.ReceiveEmailNotification,
		GitHubID:                 m.GitHubID,
		GitHubUsername:           m.GitHubUsername,
		GitHubAvatar:             m.GitHubAvatar,
		IsGitHubBound:            m.IsGitHubBound,
	}
}
