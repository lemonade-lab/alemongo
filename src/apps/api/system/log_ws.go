package system

import (
	"alemongo/src/dao"
	"alemongo/src/paths"
	"alemongo/src/permission"
	"alemongo/src/pkgs/jwt"
	"alemongo/src/settings"
	"bufio"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var logWSUpgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}

type logWSMsg struct {
	Type string `json:"type"`
	Data string `json:"data"`
}

// auth via websocket subprotocol: token.<JWT>
func extractTokenFromSubprotocol(r *http.Request) string {
	subs := websocket.Subprotocols(r)
	for _, s := range subs {
		if len(s) > 6 && s[:6] == "token." {
			return s[6:]
		}
	}
	return ""
}

func hasPermission(username string, required int) bool {
	// 临时超级管理员放行
	if dao.IsTemporarySuperAdmin(username) || dao.IsSuperAdmin(username) {
		return true
	}
	user, exists := dao.GetUserByUserName(username)
	if !exists {
		return false
	}
	perms := permission.GetPermissionsByIdentity(user.Identity)
	return permission.CheckPermission(perms, required)
}

// SystemLogWS: /api/v1/system/log/ws?size=200&timestamp=ms
func SystemLogWS(c *gin.Context) {
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
	if !hasPermission(mc.Username, permission.SystemConfigRead) {
		c.JSON(http.StatusForbidden, gin.H{"error": "权限不足"})
		return
	}

	conn, err := logWSUpgrader.Upgrade(c.Writer, c.Request, http.Header{
		"Sec-WebSocket-Protocol": []string{fmt.Sprintf("token.%s", token)},
	})
	if err != nil {
		return
	}
	defer conn.Close()

	// params
	size := 200
	if s := c.Query("size"); s != "" {
		if v, e := strconv.Atoi(s); e == nil && v > 0 {
			size = v
		}
	}
	var date time.Time
	if ts := c.Query("timestamp"); ts != "" {
		if v, e := strconv.ParseInt(ts, 10, 64); e == nil {
			date = time.Unix(v/1000, (v%1000)*int64(time.Millisecond))
		}
	}
	if date.IsZero() {
		date = time.Now()
	}

	base := settings.Conf.Log.Filename
	logPath := filepath.Join(base, date.Format("2006-01-02")+".log")

	streamLogFile(conn, logPath, size)
}

// BotLogWS: /api/v1/bot/log/ws?name=xxx&size=200&timestamp=ms
func BotLogWS(c *gin.Context) {
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
	if !hasPermission(mc.Username, permission.BotLogManage) {
		c.JSON(http.StatusForbidden, gin.H{"error": "权限不足"})
		return
	}

	name := c.Query("name")
	if name == "" || !paths.Exists(name) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "机器人不存在或缺少名称"})
		return
	}

	conn, err := logWSUpgrader.Upgrade(c.Writer, c.Request, http.Header{
		"Sec-WebSocket-Protocol": []string{fmt.Sprintf("token.%s", token)},
	})
	if err != nil {
		return
	}
	defer conn.Close()

	// params
	size := 200
	if s := c.Query("size"); s != "" {
		if v, e := strconv.Atoi(s); e == nil && v > 0 {
			size = v
		}
	}
	var date time.Time
	if ts := c.Query("timestamp"); ts != "" {
		if v, e := strconv.ParseInt(ts, 10, 64); e == nil {
			date = time.Unix(v/1000, (v%1000)*int64(time.Millisecond))
		}
	}
	if date.IsZero() {
		date = time.Now()
	}
	logPath := paths.GetBotLogByDate(name, date)
	if logPath == "" {
		// 保守返回错误
		conn.WriteJSON(logWSMsg{Type: "error", Data: "无法获取日志路径"})
		return
	}

	streamLogFile(conn, logPath, size)
}

func readLastNLines(file *os.File, n int) (string, error) {
	if n <= 0 {
		return "", nil
	}
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		return "", err
	}
	scanner := bufio.NewScanner(file)
	buf := make([]byte, 0, 1024*1024)
	scanner.Buffer(buf, 1024*1024)
	var lines []string
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}
	if err := scanner.Err(); err != nil {
		return "", err
	}
	if n > len(lines) {
		n = len(lines)
	}
	out := ""
	for _, l := range lines[len(lines)-n:] {
		out += l + "\n"
	}
	return out, nil
}

func streamLogFile(conn *websocket.Conn, path string, initLines int) {
	// 打开文件（如果不存在，等待重试几次）
	var f *os.File
	var err error
	for i := 0; i < 3; i++ {
		f, err = os.Open(path)
		if err == nil {
			break
		}
		if errors.Is(err, os.ErrNotExist) {
			time.Sleep(1 * time.Second)
			continue
		}
		conn.WriteJSON(logWSMsg{Type: "error", Data: "打开日志文件失败"})
		return
	}
	if err != nil {
		// 仍未打开
		conn.WriteJSON(logWSMsg{Type: "log", Data: ""})
		return
	}
	defer f.Close()

	// 发送初始最后 N 行
	initData, _ := readLastNLines(f, initLines)
	_ = conn.WriteJSON(logWSMsg{Type: "init", Data: initData})

	// 设置当前位置到文件末尾
	off, _ := f.Seek(0, io.SeekEnd)

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	// 读协程，监听客户端关闭
	done := make(chan struct{})
	go func() {
		defer close(done)
		for {
			if _, _, e := conn.ReadMessage(); e != nil {
				return
			}
		}
	}()

	for {
		select {
		case <-done:
			return
		case <-ticker.C:
			// 检查文件是否被截断/轮转
			info, e := os.Stat(path)
			if e != nil {
				// 文件暂不可用，跳过
				continue
			}
			if info.Size() < off {
				// 被截断或轮转，重置
				f.Close()
				f, _ = os.Open(path)
				off, _ = f.Seek(0, io.SeekStart)
			}
			if info.Size() == off {
				continue
			}
			// 从 off 读取到末尾
			if _, e := f.Seek(off, io.SeekStart); e != nil {
				continue
			}
			reader := bufio.NewReader(f)
			var chunk []byte
			for {
				line, isPrefix, e := reader.ReadLine()
				if e != nil {
					if e == io.EOF {
						break
					}
					break
				}
				if chunk == nil {
					chunk = make([]byte, 0, 1024)
				}
				chunk = append(chunk, line...)
				if !isPrefix {
					// 完整一行
					_ = conn.WriteJSON(logWSMsg{Type: "append", Data: string(chunk)})
					chunk = chunk[:0]
				}
			}
			// 更新 off
			off, _ = f.Seek(0, io.SeekCurrent)
		}
	}
}
