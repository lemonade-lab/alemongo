package notification

import (
	"alemongo/src/dao"
	"alemongo/src/permission"
	"alemongo/src/pkgs/jwt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// WebSocket 协议复用：subprotocol token.<JWT>
// 与 log/ws 实现保持一致：放开 Origin 校验（生产可后续集中加一道网关/反代限制）。
var notifyUpgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}

// 消息类型常量
const (
	EventUnreadCount = "unread"   // 未读数量变更 {type:"unread", unread:int}
	EventNew         = "new"      // 新通知 {type:"new", item:Notification}
	EventRead        = "read"     // 单条已读 {type:"read", id:uint}
	EventReadAll     = "read_all" // 全部已读 {type:"read_all"}
	EventDelete      = "delete"   // 删除 {type:"delete", id:uint}
	EventPing        = "ping"     // 心跳请求 (客户端->服务端)
	EventPong        = "pong"     // 心跳响应 (服务端->客户端)
	EventHello       = "hello"    // 初始握手 {type:"hello", version:1}
)

type wsMessage struct {
	Type   string      `json:"type"`
	ID     uint        `json:"id,omitempty"`
	Unread int         `json:"unread,omitempty"`
	Item   interface{} `json:"item,omitempty"`
}

type client struct {
	username string
	conn     *websocket.Conn
	sendCh   chan wsMessage
	quit     chan struct{}
}

func (c *client) writeLoop() {
	defer func() { recover() }()
	for {
		select {
		case m, ok := <-c.sendCh:
			if !ok {
				return
			}
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteJSON(m); err != nil {
				return
			}
		case <-c.quit:
			return
		}
	}
}

func (c *client) readLoop(onClose func()) {
	defer onClose()
	c.conn.SetReadLimit(1024)
	_ = c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(appData string) error {
		_ = c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})
	for {
		var msg wsMessage
		if err := c.conn.ReadJSON(&msg); err != nil {
			return
		}
		if msg.Type == EventPing {
			// echo pong
			select {
			case c.sendCh <- wsMessage{Type: EventPong}:
			default:
			}
		}
	}
}

// Hub 管理在线用户
type Hub struct {
	mu    sync.RWMutex
	users map[string]map[*client]struct{}
}

func newHub() *Hub { return &Hub{users: make(map[string]map[*client]struct{})} }

var notifyHub = newHub()

// _keep references to exported-like functions to avoid static unused warnings when
// build tags / future conditional compilation might remove call sites.
var _ = (*Hub).broadcast

func (h *Hub) add(c *client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	m, ok := h.users[c.username]
	if !ok {
		m = make(map[*client]struct{})
		h.users[c.username] = m
	}
	m[c] = struct{}{}
}

func (h *Hub) remove(c *client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if m, ok := h.users[c.username]; ok {
		delete(m, c)
		if len(m) == 0 {
			delete(h.users, c.username)
		}
	}
}

func (h *Hub) broadcast(username string, msg wsMessage) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	if cs, ok := h.users[username]; ok {
		for c := range cs {
			select {
			case c.sendCh <- msg:
			default:
			}
		}
	}
}

// 公共广播给所有在线用户（用于系统级通知，如果未来需要）
func (h *Hub) broadcastAll(msg wsMessage) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for _, cs := range h.users {
		for c := range cs {
			select {
			case c.sendCh <- msg:
			default:
			}
		}
	}
}

func extractTokenFromSubprotocol(r *http.Request) string {
	subs := websocket.Subprotocols(r)
	for _, s := range subs {
		if len(s) > 6 && s[:6] == "token." {
			return s[6:]
		}
	}
	return ""
}

// NotificationWS WebSocket 入口 /api/v1/notifications/ws
// 仅认证用户可连接；权限：普通用户可连接并接收自己的通知
func NotificationWS(c *gin.Context) {
	token := extractTokenFromSubprotocol(c.Request)
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "缺少认证token"})
		return
	}
	mc, err := jwt.ParseToken(token)
	if err != nil || mc == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "无效的认证token"})
		return
	}
	username := mc.Username
	// 用户存在校验；但允许临时超级管理员（尚未持久化）通过
	if _, ok := dao.GetUserByUserName(username); !ok {
		if !dao.IsTemporarySuperAdmin(username) { // 既不是持久化用户也不是临时超级管理员
			c.JSON(http.StatusUnauthorized, gin.H{"error": "用户不存在"})
			return
		}
	}

	conn, err := notifyUpgrader.Upgrade(c.Writer, c.Request, http.Header{
		"Sec-WebSocket-Protocol": []string{"token." + token},
	})
	if err != nil {
		return
	}

	cl := &client{username: username, conn: conn, sendCh: make(chan wsMessage, 16), quit: make(chan struct{})}
	notifyHub.add(cl)
	defer func() {
		notifyHub.remove(cl)
		close(cl.quit)
		close(cl.sendCh)
		conn.Close()
	}()

	// 初始推送 hello + 未读数量
	cl.sendCh <- wsMessage{Type: EventHello, Item: map[string]interface{}{"version": 1}}
	if cnt, e := dao.CountUnreadNotifications(username); e == nil {
		cl.sendCh <- wsMessage{Type: EventUnreadCount, Unread: int(cnt)}
	}

	go cl.writeLoop()
	cl.readLoop(func() {})
}

// ======= 供 handler 调用的推送辅助函数 =======

func pushUnread(username string) {
	if cnt, e := dao.CountUnreadNotifications(username); e == nil {
		notifyHub.broadcast(username, wsMessage{Type: EventUnreadCount, Unread: int(cnt)})
	}
}

func pushNew(username string, item interface{}) {
	notifyHub.broadcast(username, wsMessage{Type: EventNew, Item: item})
}
func pushRead(username string, id uint) {
	notifyHub.broadcast(username, wsMessage{Type: EventRead, ID: id})
}
func pushReadAll(username string) { notifyHub.broadcast(username, wsMessage{Type: EventReadAll}) }
func pushDelete(username string, id uint) {
	notifyHub.broadcast(username, wsMessage{Type: EventDelete, ID: id})
}

// Integrate permission dummy reference to avoid unused import warning (if not yet used)
var _ = permission.SystemConfigRead
