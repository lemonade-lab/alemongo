package dao

import (
	"alemongo/src/dao/db"
	"alemongo/src/models"
	"errors"

	"gorm.io/gorm"
)

// GetSetting 根据 key 获取配置
func GetSetting(key string) (*models.Setting, error) {
	if key == "" {
		return nil, errors.New("key 不能为空")
	}
	if db.Get() == nil {
		return nil, errors.New("数据库未初始化")
	}
	var s db.SettingDO
	if err := db.Get().Where("key = ?", key).First(&s).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &models.Setting{Key: s.Key, Value: s.Value, Category: s.Category, Version: s.Version, Editable: s.Editable, UpdatedBy: s.UpdatedBy}, nil
}

// ListSettings 条件列出配置
func ListSettings(category string) ([]models.Setting, error) {
	if db.Get() == nil {
		return nil, errors.New("数据库未初始化")
	}
	q := db.Get().Model(&db.SettingDO{})
	if category != "" {
		q = q.Where("category = ?", category)
	}
	var list []db.SettingDO
	if err := q.Order("key asc").Find(&list).Error; err != nil {
		return nil, err
	}
	res := make([]models.Setting, 0, len(list))
	for i := range list {
		d := list[i]
		res = append(res, models.Setting{Key: d.Key, Value: d.Value, Category: d.Category, Version: d.Version, Editable: d.Editable, UpdatedBy: d.UpdatedBy})
	}
	return res, nil
}

// UpsertSetting 新增或更新配置（版本递增）
func UpsertSetting(m *models.Setting) error {
	if m == nil || m.Key == "" {
		return errors.New("非法参数")
	}
	if db.Get() == nil {
		return errors.New("数据库未初始化")
	}
	return db.Get().Transaction(func(tx *gorm.DB) error {
		var existing db.SettingDO
		if err := tx.Where("key = ?", m.Key).First(&existing).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				rec := db.SettingDO{Key: m.Key, Value: m.Value, Category: m.Category, Version: 1, Editable: true, UpdatedBy: m.UpdatedBy}
				if !m.Editable {
					rec.Editable = false
				}
				return tx.Create(&rec).Error
			}
			return err
		}
		if !existing.Editable {
			return errors.New("该配置不可编辑")
		}
		// 乐观锁：如果调用方带版本且不匹配则失败
		if m.Version != 0 && m.Version != existing.Version {
			return errors.New("版本冲突，请刷新后重试")
		}
		updates := map[string]interface{}{"value": m.Value, "version": existing.Version + 1}
		if m.Category != "" {
			updates["category"] = m.Category
		}
		if m.UpdatedBy != "" {
			updates["updated_by"] = m.UpdatedBy
		}
		return tx.Model(&db.SettingDO{}).Where("id = ?", existing.ID).Updates(updates).Error
	})
}

// DeleteSetting 删除配置
func DeleteSetting(key string) error {
	if key == "" {
		return errors.New("key 不能为空")
	}
	if db.Get() == nil {
		return errors.New("数据库未初始化")
	}
	return db.Get().Where("key = ?", key).Delete(&db.SettingDO{}).Error
}
