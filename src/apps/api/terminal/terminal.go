package terminal

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"sync"
	"time"

	"alemongo/src/dao"
	"alemongo/src/pkgs/jwt"

	"github.com/creack/pty"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// TerminalSession 终端会话
type TerminalSession struct {
	ID       string
	PTY      *os.File
	Command  *exec.Cmd
	Context  context.Context
	Cancel   context.CancelFunc
	LastUsed time.Time
	mu       sync.RWMutex
}

// TerminalMessage WebSocket消息结构
type TerminalMessage struct {
	Type string `json:"type"`
	Data string `json:"data"`
	Cols int    `json:"cols,omitempty"`
	Rows int    `json:"rows,omitempty"`
}

// TerminalManager 终端管理器
type TerminalManager struct {
	sessions map[string]*TerminalSession
	mu       sync.RWMutex
	upgrader websocket.Upgrader
}

var manager *TerminalManager

func init() {
	manager = &TerminalManager{
		sessions: make(map[string]*TerminalSession),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // 在生产环境中应该检查来源
			},
		},
	}
}

// GetTerminalManager 获取终端管理器实例
func GetTerminalManager() *TerminalManager {
	return manager
}

// CreateSession 创建新的终端会话
func (tm *TerminalManager) CreateSession(sessionID string) (*TerminalSession, error) {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	// 检查会话是否已存在
	if session, exists := tm.sessions[sessionID]; exists {
		return session, nil
	}

	// 根据操作系统选择shell
	var shell string
	var args []string

	switch runtime.GOOS {
	case "windows":
		shell = "cmd.exe"
		args = []string{}
	case "darwin", "linux":
		shell = os.Getenv("SHELL")
		if shell == "" {
			shell = "/bin/bash"
		}
		args = []string{}
	default:
		return nil, fmt.Errorf("不支持的操作系统: %s", runtime.GOOS)
	}

	// 创建命令
	ctx, cancel := context.WithCancel(context.Background())
	cmd := exec.CommandContext(ctx, shell, args...)

	// 设置工作目录为用户主目录
	homeDir, err := os.UserHomeDir()
	if err != nil {
		homeDir = "/"
	}
	cmd.Dir = homeDir

	// 设置环境变量，确保终端正确工作（需在启动前设置）
	cmd.Env = append(os.Environ(),
		"TERM=xterm-256color",
		"COLORTERM=truecolor",
	)

	// 创建PTY
	log.Printf("启动终端会话: %s, shell: %s, 工作目录: %s", sessionID, shell, cmd.Dir)
	ptmx, err := pty.Start(cmd)
	if err != nil {
		cancel()
		log.Printf("启动PTY失败: %v", err)
		return nil, fmt.Errorf("启动PTY失败: %v", err)
	}
	log.Printf("PTY启动成功: %s", sessionID)

	// 设置PTY大小
	pty.Setsize(ptmx, &pty.Winsize{
		Rows: 24,
		Cols: 80,
	})

	session := &TerminalSession{
		ID:       sessionID,
		PTY:      ptmx,
		Command:  cmd,
		Context:  ctx,
		Cancel:   cancel,
		LastUsed: time.Now(),
	}

	tm.sessions[sessionID] = session
	return session, nil
}

// GetSession 获取终端会话
func (tm *TerminalManager) GetSession(sessionID string) (*TerminalSession, bool) {
	tm.mu.RLock()
	defer tm.mu.RUnlock()
	session, exists := tm.sessions[sessionID]
	return session, exists
}

// CloseSession 关闭终端会话
func (tm *TerminalManager) CloseSession(sessionID string) error {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	session, exists := tm.sessions[sessionID]
	if !exists {
		return nil
	}

	// 取消上下文
	session.Cancel()

	// 关闭PTY
	if session.PTY != nil {
		session.PTY.Close()
	}

	// 等待命令结束
	if session.Command != nil && session.Command.Process != nil {
		session.Command.Process.Kill()
		session.Command.Wait()
	}

	delete(tm.sessions, sessionID)
	return nil
}

// ResizeSession 调整终端大小
func (tm *TerminalManager) ResizeSession(sessionID string, cols, rows int) error {
	session, exists := tm.GetSession(sessionID)
	if !exists {
		return fmt.Errorf("会话不存在: %s", sessionID)
	}

	return pty.Setsize(session.PTY, &pty.Winsize{
		Rows: uint16(rows),
		Cols: uint16(cols),
	})
}

// WriteToSession 向终端写入数据
func (tm *TerminalManager) WriteToSession(sessionID string, data []byte) error {
	session, exists := tm.GetSession(sessionID)
	if !exists {
		return fmt.Errorf("会话不存在: %s", sessionID)
	}

	session.mu.Lock()
	defer session.mu.Unlock()
	session.LastUsed = time.Now()

	n, err := session.PTY.Write(data)
	if err != nil {
		return err
	}

	log.Printf("写入 %d 字节到 PTY", n)
	return nil
}

// ReadFromSession 从终端读取数据
func (tm *TerminalManager) ReadFromSession(sessionID string) ([]byte, error) {
	session, exists := tm.GetSession(sessionID)
	if !exists {
		return nil, fmt.Errorf("会话不存在: %s", sessionID)
	}

	// 仅在短窗口内更新最后使用时间，避免长时间持锁
	session.mu.Lock()
	session.LastUsed = time.Now()
	session.mu.Unlock()

	// 可选：设置读取超时（部分平台/FD可能不支持，忽略错误）
	if err := session.PTY.SetReadDeadline(time.Now().Add(100 * time.Millisecond)); err != nil {
		// 忽略不支持超时设置的错误
	}

	buffer := make([]byte, 4096)
	n, err := session.PTY.Read(buffer)
	if err != nil {
		// 如果是超时错误，返回空数据而不是错误
		if netErr, ok := err.(net.Error); ok && netErr.Timeout() {
			return nil, nil
		}
		return nil, err
	}

	return buffer[:n], nil
}

// HandleWebSocket 处理WebSocket连接
func HandleWebSocket(c *gin.Context) {
	// 从 WebSocket subprotocol 中获取 token
	subprotocols := websocket.Subprotocols(c.Request)
	var token string
	for _, protocol := range subprotocols {
		if len(protocol) > 6 && protocol[:6] == "token." {
			token = protocol[6:] // 提取 "token." 后面的部分
			break
		}
	}

	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "缺少认证token"})
		return
	}

	// 验证 JWT token
	mc, err := jwt.ParseToken(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "无效的认证token"})
		return
	}

	// 权限检查：仅允许超级管理员（包括临时超级管理员）使用终端
	// 与账户管理保持一致：dao.IsSuperAdmin 会同时判断持久化超级管理员与临时超级管理员
	if !dao.IsSuperAdmin(mc.Username) {
		c.JSON(http.StatusForbidden, gin.H{"error": "仅超级管理员可使用终端"})
		return
	}

	log.Printf("超级管理员 %s 请求终端连接", mc.Username)

	// 升级为WebSocket连接，支持 subprotocol
	conn, err := manager.upgrader.Upgrade(c.Writer, c.Request, http.Header{
		"Sec-WebSocket-Protocol": []string{fmt.Sprintf("token.%s", token)},
	})
	if err != nil {
		log.Printf("WebSocket升级失败: %v", err)
		return
	}
	defer conn.Close()

	// 生成会话ID
	sessionID := fmt.Sprintf("terminal_%d", time.Now().UnixNano())

	// 创建终端会话
	session, err := manager.CreateSession(sessionID)
	if err != nil {
		log.Printf("创建终端会话失败: %v", err)
		conn.WriteMessage(websocket.TextMessage, []byte(`{"type":"error","data":"创建终端失败"}`))
		return
	}
	defer manager.CloseSession(sessionID)

	// 发送会话ID给客户端
	conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`{"type":"session","data":"%s"}`, sessionID)))

	// 启动读取goroutine
	go func() {
		defer conn.Close()
		for {
			select {
			case <-session.Context.Done():
				return
			default:
				data, err := manager.ReadFromSession(sessionID)
				if err != nil {
					if err != io.EOF {
						log.Printf("读取终端数据失败: %v", err)
					}
					return
				}

				// 如果没有数据（超时），继续循环
				if len(data) == 0 {
					continue
				}

				message := TerminalMessage{
					Type: "output",
					Data: string(data),
				}

				jsonData, _ := json.Marshal(message)
				if err := conn.WriteMessage(websocket.TextMessage, jsonData); err != nil {
					log.Printf("发送数据失败: %v", err)
					return
				}
			}
		}
	}()

	// 处理客户端消息
	messageCount := 0
	for {
		_, messageData, err := conn.ReadMessage()
		if err != nil {
			// 检查是否是连接关闭错误
			if websocket.IsCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure, websocket.CloseNormalClosure) {
				log.Printf("WebSocket连接已关闭: %v", err)
				break
			}
			// 检查是否是临时网络错误
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket意外关闭: %v", err)
				break
			}
			// 其他错误可能是临时的，记录但不退出
			log.Printf("读取WebSocket消息时发生临时错误: %v，继续等待消息", err)
			time.Sleep(100 * time.Millisecond) // 短暂等待后继续
			continue
		}

		messageCount++
		log.Printf("收到第 %d 条原始消息: %s", messageCount, string(messageData))

		var message TerminalMessage
		if err := json.Unmarshal(messageData, &message); err != nil {
			log.Printf("解析消息失败: %v", err)
			continue
		}

		log.Printf("解析后的消息: %+v", message)

		switch message.Type {
		case "input":
			// 处理用户输入
			log.Printf("收到输入消息: %s, 数据: %q", sessionID, message.Data)
			if err := manager.WriteToSession(sessionID, []byte(message.Data)); err != nil {
				log.Printf("写入终端数据失败: %v", err)
			} else {
				log.Printf("成功写入终端数据: %q", message.Data)
			}
		case "resize":
			// 处理终端大小调整
			if err := manager.ResizeSession(sessionID, message.Cols, message.Rows); err != nil {
				log.Printf("调整终端大小失败: %v", err)
			}
		case "ping":
			// 心跳检测
			conn.WriteMessage(websocket.TextMessage, []byte(`{"type":"pong"}`))
		}
	}
}

// GetSessions 获取所有活跃会话（仅超级管理员）
func GetSessions(c *gin.Context) {
	// 检查用户权限
	userInfo, exists := c.Get("user_info")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未授权"})
		return
	}

	userMap, ok := userInfo.(map[string]interface{})
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户信息格式错误"})
		return
	}

	identity, ok := userMap["identity"].(string)
	if !ok || identity != "super_admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "仅超级管理员可查看终端会话"})
		return
	}

	manager.mu.RLock()
	defer manager.mu.RUnlock()

	sessions := make([]map[string]interface{}, 0, len(manager.sessions))
	for id, session := range manager.sessions {
		sessions = append(sessions, map[string]interface{}{
			"id":        id,
			"last_used": session.LastUsed,
			"status":    "active",
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"sessions": sessions,
		"count":    len(sessions),
	})
}

// CloseSessionAPI 关闭指定会话（仅超级管理员）
func CloseSessionAPI(c *gin.Context) {
	// 检查用户权限
	userInfo, exists := c.Get("user_info")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未授权"})
		return
	}

	userMap, ok := userInfo.(map[string]interface{})
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户信息格式错误"})
		return
	}

	identity, ok := userMap["identity"].(string)
	if !ok || identity != "super_admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "仅超级管理员可关闭终端会话"})
		return
	}

	sessionID := c.Param("id")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "会话ID不能为空"})
		return
	}

	if err := manager.CloseSession(sessionID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "会话已关闭"})
}
