package multibots

import (
	"alemongo/src/apps/api/response"
	config "alemongo/src/paths"
	"bufio"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// parseTimestamp 解析毫秒时间戳，未提供则返回当前时间
func parseTimestamp(ctx *gin.Context) (time.Time, error) {
	timestamp := ctx.PostForm("timestamp")
	if timestamp == "" {
		return time.Now(), nil
	}
	timestampInt, err := strconv.ParseInt(timestamp, 10, 64)
	if err != nil {
		return time.Time{}, fmt.Errorf("时间戳格式错误")
	}
	return time.Unix(timestampInt/1000, (timestampInt%1000)*int64(time.Millisecond)), nil
}

// MultiBotLog 多配置机器人日志（分页）
// POST /api/v1/multibot/log
// params: name, process_name, page, pageSize, timestamp
func MultiBotLog(ctx *gin.Context) {
	name := ctx.PostForm("name")
	processName := ctx.PostForm("process_name")
	pageStr := ctx.PostForm("page")
	pageSizeStr := ctx.PostForm("pageSize")

	if name == "" || processName == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "name 和 process_name 不能为空")
		return
	}
	if pageStr == "" || pageSizeStr == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "参数错误")
		return
	}
	page, err := strconv.Atoi(pageStr)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	if !config.MultiBotExists(name) {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "多配置机器人不存在")
		return
	}

	date, err := parseTimestamp(ctx)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}

	logPath := config.GetMultiBotLogByDate(name, processName, date)
	if logPath == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "无法获取日志路径")
		return
	}

	logFile, err := os.Open(logPath)
	if err != nil {
		if os.IsNotExist(err) {
			ctx.JSON(http.StatusOK, gin.H{
				"code": http.StatusOK,
				"msg":  "请求成功",
				"data": gin.H{
					"log":   "",
					"count": 0,
				},
			})
			return
		}
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "打开日志文件失败")
		return
	}
	defer logFile.Close()

	scanner := bufio.NewScanner(logFile)
	buf := make([]byte, 0, 1024*1024)
	scanner.Buffer(buf, 1024*1024)

	var logLines []string
	lineCount := 0
	startLine := (page - 1) * pageSize
	if startLine < 0 {
		startLine = 0
	}
	endLine := startLine + pageSize

	for scanner.Scan() {
		lineCount++
		if lineCount > startLine && lineCount <= endLine {
			logLines = append(logLines, scanner.Text())
		}
	}
	if err := scanner.Err(); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "日志文件读取错误")
		return
	}

	logData := ""
	for _, line := range logLines {
		logData += line + "\n"
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": gin.H{
			"log":   logData,
			"count": lineCount,
		},
	})
}

// MultiBotLogOnline 多配置机器人在线日志（最后N行）
// POST /api/v1/multibot/log-online
// params: name, process_name, size, timestamp
func MultiBotLogOnline(ctx *gin.Context) {
	name := ctx.PostForm("name")
	processName := ctx.PostForm("process_name")
	sizeStr := ctx.PostForm("size")

	if name == "" || processName == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "name 和 process_name 不能为空")
		return
	}
	if sizeStr == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "参数错误")
		return
	}
	size, err := strconv.Atoi(sizeStr)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	if !config.MultiBotExists(name) {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "多配置机器人不存在")
		return
	}

	date, err := parseTimestamp(ctx)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}

	logPath := config.GetMultiBotLogByDate(name, processName, date)
	if logPath == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "无法获取日志路径")
		return
	}

	logFile, err := os.Open(logPath)
	if err != nil {
		if os.IsNotExist(err) {
			ctx.JSON(http.StatusOK, gin.H{
				"code": http.StatusOK,
				"msg":  "请求成功",
				"data": gin.H{
					"log": "",
				},
			})
			return
		}
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "打开日志文件失败")
		return
	}
	defer logFile.Close()

	scanner := bufio.NewScanner(logFile)
	var logLines []string
	for scanner.Scan() {
		logLines = append(logLines, scanner.Text())
	}
	if err := scanner.Err(); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "日志文件读取错误")
		return
	}

	if size > len(logLines) {
		size = len(logLines)
	}
	logData := ""
	for _, line := range logLines[len(logLines)-size:] {
		logData += line + "\n"
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": gin.H{
			"log": logData,
		},
	})
}

// MultiBotLogDelete 删除多配置机器人日志
// POST /api/v1/multibot/log/delete
// params: name, process_name, timestamp
func MultiBotLogDelete(ctx *gin.Context) {
	name := ctx.PostForm("name")
	processName := ctx.PostForm("process_name")

	if name == "" || processName == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "name 和 process_name 不能为空")
		return
	}
	if !config.MultiBotExists(name) {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "多配置机器人不存在")
		return
	}

	date, err := parseTimestamp(ctx)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}

	logDate := date.Format("2006-01-02")
	today := time.Now().Format("2006-01-02")
	logPath := config.GetMultiBotLogByDate(name, processName, date)
	if logPath == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "无法获取日志路径")
		return
	}

	if _, err := os.Stat(logPath); os.IsNotExist(err) {
		ctx.JSON(http.StatusOK, gin.H{
			"code": http.StatusOK,
			"msg":  "请求成功",
			"data": "",
		})
		return
	}

	if today == logDate {
		err = os.Truncate(logPath, 0)
	} else {
		err = os.Remove(logPath)
	}

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "删除日志文件失败",
			"data": nil,
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": "删除成功",
	})
}

// MultiBotLogDownload 下载多配置机器人日志
// GET /api/v1/multibot/log/download?name=xxx&process_name=yyy&date=YYYY-MM-DD
func MultiBotLogDownload(ctx *gin.Context) {
	name := ctx.Query("name")
	processName := ctx.Query("process_name")
	dateStr := ctx.Query("date")

	if name == "" || processName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "name 和 process_name 不能为空",
			"data": nil,
		})
		return
	}
	if !config.MultiBotExists(name) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "多配置机器人不存在",
			"data": nil,
		})
		return
	}

	var date time.Time
	if dateStr == "" {
		now := time.Now()
		date = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		dateStr = now.Format("2006-01-02")
	} else {
		t, err := time.ParseInLocation("2006-01-02", dateStr, time.Local)
		if err != nil {
			response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "日期格式错误，应为 YYYY-MM-DD")
			return
		}
		date = t
	}

	logPath := config.GetMultiBotLogByDate(name, processName, date)
	if logPath == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "无法获取日志路径")
		return
	}
	if _, err := os.Stat(logPath); os.IsNotExist(err) {
		response.ResponseErrorWithMsg(ctx, http.StatusNotFound, http.StatusNotFound, "日志文件不存在")
		return
	}

	filename := fmt.Sprintf("%s-%s-%s.log", name, processName, dateStr)
	ctx.FileAttachment(logPath, filename)
}
