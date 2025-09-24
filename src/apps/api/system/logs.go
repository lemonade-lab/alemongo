package system

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/settings"
	"bufio"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// GET /api/v1/system/log (POST form for consistency)
// name: (unused) page, pageSize, timestamp(ms)
func Log(ctx *gin.Context) {
	pageStr := ctx.PostForm("page")
	pageSizeStr := ctx.PostForm("pageSize")
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

	// 解析日期
	timestamp := ctx.PostForm("timestamp")
	var date time.Time
	if timestamp != "" {
		ts, err := strconv.ParseInt(timestamp, 10, 64)
		if err != nil {
			response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "时间戳格式错误")
			return
		}
		date = time.Unix(ts/1000, (ts%1000)*int64(time.Millisecond))
	} else {
		date = time.Now()
	}

	// 主系统日志路径（按天分割）
	base := settings.Conf.Log.Filename // e.g. work/logs
	logPath := filepath.Join(base, date.Format("2006-01-02")+".log")

	f, err := os.Open(logPath)
	if err != nil {
		if os.IsNotExist(err) {
			ctx.JSON(http.StatusOK, gin.H{"code": http.StatusOK, "msg": "请求成功", "data": gin.H{"log": "", "count": 0}})
			return
		}
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "打开日志文件失败")
		return
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	buf := make([]byte, 0, 1024*1024)
	scanner.Buffer(buf, 1024*1024)
	var lines []string
	count := 0
	start := (page - 1) * pageSize
	if start < 0 {
		start = 0
	}
	end := start + pageSize
	for scanner.Scan() {
		count++
		if count > start && count <= end {
			lines = append(lines, scanner.Text())
		}
	}
	if err := scanner.Err(); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "日志文件读取错误")
		return
	}
	out := ""
	for _, l := range lines {
		out += l + "\n"
	}
	ctx.JSON(http.StatusOK, gin.H{"code": http.StatusOK, "msg": "请求成功", "data": gin.H{"log": out, "count": count}})
}

// POST /api/v1/system/log-online
func LogOnline(ctx *gin.Context) {
	sizeStr := ctx.PostForm("size")
	if sizeStr == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "参数错误")
		return
	}
	size, err := strconv.Atoi(sizeStr)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	timestamp := ctx.PostForm("timestamp")
	var date time.Time
	if timestamp != "" {
		ts, err := strconv.ParseInt(timestamp, 10, 64)
		if err != nil {
			response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "时间戳格式错误")
			return
		}
		date = time.Unix(ts/1000, (ts%1000)*int64(time.Millisecond))
	} else {
		date = time.Now()
	}

	base := settings.Conf.Log.Filename
	logPath := filepath.Join(base, date.Format("2006-01-02")+".log")
	f, err := os.Open(logPath)
	if err != nil {
		if os.IsNotExist(err) {
			ctx.JSON(http.StatusOK, gin.H{"code": http.StatusOK, "msg": "请求成功", "data": gin.H{"log": ""}})
			return
		}
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "打开日志文件失败")
		return
	}
	defer f.Close()
	scanner := bufio.NewScanner(f)
	var lines []string
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}
	if err := scanner.Err(); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "日志文件读取错误")
		return
	}
	if size > len(lines) {
		size = len(lines)
	}
	out := ""
	for _, l := range lines[len(lines)-size:] {
		out += l + "\n"
	}
	ctx.JSON(http.StatusOK, gin.H{"code": http.StatusOK, "msg": "请求成功", "data": gin.H{"log": out}})
}

// GET /api/v1/system/log/download?date=YYYY-MM-DD
func LogDownload(ctx *gin.Context) {
	dateStr := ctx.Query("date")
	if dateStr == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "缺少日期参数")
		return
	}
	base := settings.Conf.Log.Filename
	logPath := filepath.Join(base, dateStr+".log")
	if _, err := os.Stat(logPath); os.IsNotExist(err) {
		ctx.JSON(http.StatusNotFound, gin.H{"code": http.StatusNotFound, "msg": "日志文件不存在"})
		return
	}
	ctx.FileAttachment(logPath, "system-"+dateStr+".log")
}
