package session

import (
	"alemongo/src/settings"
	"crypto/rand"
	"encoding/hex"
	"sync"
	"time"
)

const (
	CookieName = "alemongo_session"
)

// SessionData 存储会话信息
type SessionData struct {
	Username  string
	CreatedAt time.Time
}

// Store 会话存储
type Store struct {
	mu       sync.RWMutex
	sessions map[string]*SessionData
}

var store = &Store{
	sessions: make(map[string]*SessionData),
}

// generateID 生成随机会话ID
func generateID() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// Create 创建会话，返回 sessionID
func Create(username string) (string, error) {
	id, err := generateID()
	if err != nil {
		return "", err
	}

	store.mu.Lock()
	defer store.mu.Unlock()

	store.sessions[id] = &SessionData{
		Username:  username,
		CreatedAt: time.Now(),
	}

	return id, nil
}

// Get 根据 sessionID 获取会话数据，同时校验是否过期
func Get(sessionID string) (*SessionData, bool) {
	store.mu.RLock()
	defer store.mu.RUnlock()

	data, ok := store.sessions[sessionID]
	if !ok {
		return nil, false
	}

	// 检查是否过期
	expiresDays := settings.Conf.Session.ExpiresDays
	if time.Since(data.CreatedAt) > time.Duration(expiresDays)*24*time.Hour {
		// 过期了，异步清理
		go Delete(sessionID)
		return nil, false
	}

	return data, true
}

// Delete 删除会话
func Delete(sessionID string) {
	store.mu.Lock()
	defer store.mu.Unlock()
	delete(store.sessions, sessionID)
}

// DeleteByUsername 删除指定用户的所有会话
func DeleteByUsername(username string) {
	store.mu.Lock()
	defer store.mu.Unlock()
	for id, data := range store.sessions {
		if data.Username == username {
			delete(store.sessions, id)
		}
	}
}

// MaxAge 获取 cookie 最大存活秒数
func MaxAge() int {
	return int(settings.Conf.Session.ExpiresDays) * 24 * 3600
}

// CleanupExpired 清理过期会话（可定期调用）
func CleanupExpired() {
	store.mu.Lock()
	defer store.mu.Unlock()

	expiry := time.Duration(settings.Conf.Session.ExpiresDays) * 24 * time.Hour

	for id, data := range store.sessions {
		if time.Since(data.CreatedAt) > expiry {
			delete(store.sessions, id)
		}
	}
}

// StartCleanupTask 启动后台清理任务
func StartCleanupTask() {
	go func() {
		ticker := time.NewTicker(30 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			CleanupExpired()
		}
	}()
}
