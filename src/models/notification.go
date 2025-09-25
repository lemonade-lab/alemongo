package models

import "time"

// Notification 站内消息 / 系统通知展示模型
// Status: unread / read
// Type: system / task / alert / message
// Extra: JSON 附加信息（跳转链接、相关资源ID等）
type Notification struct {
	ID        uint       `json:"id"`
	UserName  string     `json:"userName"`
	Type      string     `json:"type"`
	Title     string     `json:"title"`
	Content   string     `json:"content"`
	Status    string     `json:"status"`
	Extra     string     `json:"extra,omitempty"`
	ReadAt    *time.Time `json:"readAt,omitempty"`
	CreatedAt time.Time  `json:"createdAt"`
}
