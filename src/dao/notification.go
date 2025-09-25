package dao

import (
	"alemongo/src/dao/db"
	"alemongo/src/models"
	"errors"
	"time"
)

// CreateNotification 创建通知
func CreateNotification(n *models.Notification) error {
	if n == nil || n.UserName == "" || n.Title == "" || n.Type == "" {
		return errors.New("参数不完整")
	}
	if db.Get() == nil {
		return errors.New("数据库未初始化")
	}
	rec := db.NotificationDO{UserName: n.UserName, Type: n.Type, Title: n.Title, Content: n.Content, Status: "unread", Extra: n.Extra}
	return db.Get().Create(&rec).Error
}

// ListNotifications 列出某用户通知（分页）
func ListNotifications(userName string, status string, limit, offset int) ([]models.Notification, int64, error) {
	if userName == "" {
		return nil, 0, errors.New("用户名不能为空")
	}
	if db.Get() == nil {
		return nil, 0, errors.New("数据库未初始化")
	}
	q := db.Get().Model(&db.NotificationDO{}).Where("user_name = ?", userName)
	if status != "" {
		q = q.Where("status = ?", status)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []db.NotificationDO
	if err := q.Order("id desc").Limit(limit).Offset(offset).Find(&list).Error; err != nil {
		return nil, 0, err
	}
	res := make([]models.Notification, 0, len(list))
	for i := range list {
		d := list[i]
		res = append(res, models.Notification{ID: d.ID, UserName: d.UserName, Type: d.Type, Title: d.Title, Content: d.Content, Status: d.Status, Extra: d.Extra, ReadAt: d.ReadAt, CreatedAt: d.CreatedAt})
	}
	return res, total, nil
}

// MarkNotificationRead 单条设为已读
func MarkNotificationRead(id uint, userName string) error {
	if id == 0 || userName == "" {
		return errors.New("参数错误")
	}
	if db.Get() == nil {
		return errors.New("数据库未初始化")
	}
	now := time.Now()
	return db.Get().Model(&db.NotificationDO{}).Where("id = ? AND user_name = ? AND status = ?", id, userName, "unread").Updates(map[string]interface{}{"status": "read", "read_at": &now}).Error
}

// MarkAllNotificationsRead 全部设为已读
func MarkAllNotificationsRead(userName string) error {
	if userName == "" {
		return errors.New("用户名不能为空")
	}
	if db.Get() == nil {
		return errors.New("数据库未初始化")
	}
	now := time.Now()
	return db.Get().Model(&db.NotificationDO{}).Where("user_name = ? AND status = ?", userName, "unread").Updates(map[string]interface{}{"status": "read", "read_at": &now}).Error
}

// DeleteNotification 删除通知
func DeleteNotification(id uint, userName string) error {
	if id == 0 || userName == "" {
		return errors.New("参数错误")
	}
	if db.Get() == nil {
		return errors.New("数据库未初始化")
	}
	return db.Get().Where("id = ? AND user_name = ?", id, userName).Delete(&db.NotificationDO{}).Error
}

// CountUnreadNotifications 未读数量
func CountUnreadNotifications(userName string) (int64, error) {
	if userName == "" {
		return 0, errors.New("用户名不能为空")
	}
	if db.Get() == nil {
		return 0, errors.New("数据库未初始化")
	}
	var c int64
	if err := db.Get().Model(&db.NotificationDO{}).Where("user_name = ? AND status = ?", userName, "unread").Count(&c).Error; err != nil {
		return 0, err
	}
	return c, nil
}
