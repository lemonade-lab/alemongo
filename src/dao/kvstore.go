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
	if err := db.Get().Where("`key` = ?", key).First(&s).Error; err != nil {
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
	if err := q.Order("`key` asc").Find(&list).Error; err != nil {
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
		if err := tx.Where("`key` = ?", m.Key).First(&existing).Error; err != nil {
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
	return db.Get().Where("`key` = ?", key).Delete(&db.SettingDO{}).Error
}

// ================== Bot Configs KV Store ==================

const BotConfigCategory = "bot_config"

// GetBotConfig 获取指定名称的 bot 配置
func GetBotConfig(name string) (string, error) {
	if name == "" {
		return "", errors.New("配置名不能为空")
	}
	setting, err := GetSetting(name)
	if err != nil {
		return "", err
	}
	if setting == nil {
		return "", nil
	}
	return setting.Value, nil
}

// ListBotConfigs 列出所有 bot 配置名称
func ListBotConfigs() ([]string, error) {
	settings, err := ListSettings(BotConfigCategory)
	if err != nil {
		return nil, err
	}
	names := make([]string, 0, len(settings))
	for _, s := range settings {
		names = append(names, s.Key)
	}
	return names, nil
}

// UpsertBotConfig 创建或更新 bot 配置
func UpsertBotConfig(name, content string) error {
	if name == "" {
		return errors.New("配置名不能为空")
	}
	if content == "" {
		return errors.New("配置内容不能为空")
	}
	return UpsertSetting(&models.Setting{
		Key:      name,
		Value:    content,
		Category: BotConfigCategory,
		Editable: true,
	})
}

// DeleteBotConfig 删除指定的 bot 配置
func DeleteBotConfig(name string) error {
	if name == "" {
		return errors.New("配置名不能为空")
	}
	if db.Get() == nil {
		return errors.New("数据库未初始化")
	}
	// 确保只删除 bot_config 类别的配置
	return db.Get().Where("`key` = ? AND category = ?", name, BotConfigCategory).Delete(&db.SettingDO{}).Error
}

// BotConfigExists 检查配置是否存在
func BotConfigExists(name string) (bool, error) {
	if name == "" {
		return false, errors.New("配置名不能为空")
	}
	setting, err := GetSetting(name)
	if err != nil {
		return false, err
	}
	return setting != nil && setting.Category == BotConfigCategory, nil
}

// ================== 配置导入导出 ==================

// ExportSettings 导出指定类别的所有配置
// category 为空时导出所有配置
func ExportSettings(category string) ([]models.Setting, error) {
	return ListSettings(category)
}

// ImportSettings 批量导入配置
// overwrite: true 表示覆盖已存在的配置，false 表示跳过已存在的配置
func ImportSettings(settings []models.Setting, overwrite bool) (imported int, skipped int, failed int, err error) {
	if db.Get() == nil {
		return 0, 0, 0, errors.New("数据库未初始化")
	}

	for _, s := range settings {
		if s.Key == "" {
			failed++
			continue
		}

		// 检查是否已存在
		existing, err := GetSetting(s.Key)
		if err != nil {
			failed++
			continue
		}

		if existing != nil {
			if !overwrite {
				skipped++
				continue
			}
			// 覆盖模式：更新现有配置
			if err := UpsertSetting(&s); err != nil {
				failed++
				continue
			}
			imported++
		} else {
			// 新增配置
			if err := UpsertSetting(&s); err != nil {
				failed++
				continue
			}
			imported++
		}
	}

	return imported, skipped, failed, nil
}
