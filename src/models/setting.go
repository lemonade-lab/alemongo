package models

// Setting 系统动态配置展示模型
// Value 建议存储为 JSON 字符串或基本类型序列化后的文本
// Editable 标识前端是否允许编辑
// Version 用于实现乐观锁或版本回滚
// Category 对配置进行逻辑分组（system/email/feature/security 等）
type Setting struct {
	Key       string `json:"key"`
	Value     string `json:"value"`
	Category  string `json:"category,omitempty"`
	Version   uint   `json:"version"`
	Editable  bool   `json:"editable"`
	UpdatedBy string `json:"updatedBy,omitempty"`
}
