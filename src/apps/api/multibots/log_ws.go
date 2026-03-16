package multibots

import (
	"alemongo/src/dao"
	"alemongo/src/paths"
	"alemongo/src/permission"
	"alemongo/src/pkgs/session"
	"bufio"
	"errors"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var multiBotLogWSUpgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}

type multiBotLogWSMsg struct {
	Type string `json:"type"`
	Data string `json:"data"`
}

// MultiBotLogWS WebSocket 实时日志流
// GET /api/v1/multibot/log/ws?name=xxx&process_name=yyy&size=200&timestamp=ms
func MultiBotLogWS(c *gin.Context) {
	// 使用 session cookie 鉴权（与 BotLogWS 一致）
	sessionID, err := c.Cookie(session.CookieName)
	if err != nil || sessionID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未认证或会话已过期"})
		return
	}
	data, ok := session.Get(sessionID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未认证或会话已过期"})
		return
	}
	username := data.Username

	// 权限检查
	if !dao.IsTemporarySuperAdmin(username) && !dao.IsSuperAdmin(username) {
		user, exists := dao.GetUserByUserName(username)
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "权限不足"})
			return
		}
		perms := permission.GetPermissionsByIdentity(user.Identity)
		if !permission.CheckPermission(perms, permission.BotLogManage) {
			c.JSON(http.StatusForbidden, gin.H{"error": "权限不足"})
			return
		}
	}

	name := c.Query("name")
	processName := c.Query("process_name")
	if name == "" || processName == "" || !paths.MultiBotExists(name) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "多配置机器人不存在或缺少参数"})
		return
	}

	conn, err := multiBotLogWSUpgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	// 解析参数
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

	logPath := paths.GetMultiBotLogByDate(name, processName, date)
	if logPath == "" {
		conn.WriteJSON(multiBotLogWSMsg{Type: "error", Data: "无法获取日志路径"})
		return
	}

	multiBotStreamLogFile(conn, logPath, size)
}

func multiBotReadLastNLines(file *os.File, n int) (string, error) {
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

func multiBotStreamLogFile(conn *websocket.Conn, path string, initLines int) {
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
		conn.WriteJSON(multiBotLogWSMsg{Type: "error", Data: "打开日志文件失败"})
		return
	}
	if err != nil {
		conn.WriteJSON(multiBotLogWSMsg{Type: "log", Data: ""})
		return
	}
	defer f.Close()

	// 发送初始最后 N 行
	initData, _ := multiBotReadLastNLines(f, initLines)
	_ = conn.WriteJSON(multiBotLogWSMsg{Type: "init", Data: initData})

	// 设置当前位置到文件末尾
	off, _ := f.Seek(0, io.SeekEnd)

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

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
			info, e := os.Stat(path)
			if e != nil {
				continue
			}
			if info.Size() < off {
				f.Close()
				f, _ = os.Open(path)
				off, _ = f.Seek(0, io.SeekStart)
			}
			if info.Size() == off {
				continue
			}
			if _, e := f.Seek(off, io.SeekStart); e != nil {
				continue
			}
			reader := bufio.NewReader(f)
			var chunk []byte
			for {
				line, isPrefix, e := reader.ReadLine()
				if e != nil {
					break
				}
				if chunk == nil {
					chunk = make([]byte, 0, 1024)
				}
				chunk = append(chunk, line...)
				if !isPrefix {
					_ = conn.WriteJSON(multiBotLogWSMsg{Type: "append", Data: string(chunk)})
					chunk = chunk[:0]
				}
			}
			off, _ = f.Seek(0, io.SeekCurrent)
		}
	}
}
