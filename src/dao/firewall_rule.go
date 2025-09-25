package dao

import (
	"alemongo/src/dao/db"
	"time"
)

// GetFirewallRuleByFingerprint 查询指纹匹配且未被删除的规则
func GetFirewallRuleByFingerprint(fp string) (*db.FirewallRuleDO, error) {
	if db.Get() == nil || fp == "" {
		return nil, nil
	}
	var rec db.FirewallRuleDO
	if err := db.Get().Where("fingerprint = ? AND status = ?", fp, "active").First(&rec).Error; err != nil {
		return nil, err
	}
	return &rec, nil
}

// CreateFirewallRuleActive 保存一条新激活规则（若已存在则忽略）
func CreateFirewallRuleActive(rec *db.FirewallRuleDO) error {
	if db.Get() == nil || rec == nil {
		return nil
	}
	// 简单幂等：如果已存在则直接返回
	var exist db.FirewallRuleDO
	if err := db.Get().Where("fingerprint = ?", rec.Fingerprint).First(&exist).Error; err == nil {
		return nil
	}
	return db.Get().Create(rec).Error
}

// MarkFirewallRuleRemoved 软删除规则，记录时间与操作者
func MarkFirewallRuleRemoved(fp, user string) error {
	if db.Get() == nil || fp == "" {
		return nil
	}
	now := time.Now()
	return db.Get().Model(&db.FirewallRuleDO{}).Where("fingerprint = ? AND status = ?", fp, "active").Updates(map[string]any{
		"status":     "removed",
		"removed_at": &now,
		"removed_by": user,
	}).Error
}
