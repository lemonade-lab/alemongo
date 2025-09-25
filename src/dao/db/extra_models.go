package db

import "time"

// SettingDO 系统可变配置键值表
type SettingDO struct {
	ID        uint `gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time

	Key       string `gorm:"size:128;uniqueIndex;not null"`
	Value     string `gorm:"type:text;not null"`
	Category  string `gorm:"size:64;index"`
	Version   uint   `gorm:"default:1"`
	Editable  bool   `gorm:"default:true"`
	UpdatedBy string `gorm:"size:128"`
}

func (SettingDO) TableName() string { return "settings" }

// NotificationDO 站内消息/系统通知
type NotificationDO struct {
	ID        uint `gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time

	UserName string `gorm:"size:128;index;not null"`
	Type     string `gorm:"size:32;index;not null"`
	Title    string `gorm:"size:256;not null"`
	Content  string `gorm:"type:text"`
	Status   string `gorm:"size:16;index"` // unread / read
	Extra    string `gorm:"type:text"`
	ReadAt   *time.Time
}

func (NotificationDO) TableName() string { return "notifications" }
