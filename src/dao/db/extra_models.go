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

// FirewallRuleDO 持久化已执行(或计划中的)防火墙规则，便于去重/回滚/审计
// Fingerprint: 规则唯一指纹 (action+backend+normalized spec)
// Status: active / removed
// RawSpec: 规范化前的原始用户输入（便于展示）
// NormalizedSpec: 规范化后的规则表示（用于生成命令、指纹）
// Backend: pf / nft / iptables / netsh / unknown
type FirewallRuleDO struct {
	ID        uint `gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time

	Fingerprint    string `gorm:"size:128;uniqueIndex;not null"`
	Action         string `gorm:"size:32;index;not null"` // allow|block
	Backend        string `gorm:"size:32;index;not null"`
	Port           int    `gorm:"index"`
	Protocol       string `gorm:"size:16"`
	Comment        string `gorm:"size:256"`
	RawSpec        string `gorm:"type:text"`
	NormalizedSpec string `gorm:"type:text"`
	Status         string `gorm:"size:16;index;default:'active'"`
	RemovedAt      *time.Time
	RemovedBy      string `gorm:"size:128"`
}

func (FirewallRuleDO) TableName() string { return "firewall_rules" }
