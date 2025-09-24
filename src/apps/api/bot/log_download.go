package bot

import (
	"alemongo/src/apps/api/response"
	config "alemongo/src/paths"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

// LogDownload 整日下载指定机器人的日志文件
// GET /api/v1/bot/log/download?name=xxx&date=YYYY-MM-DD
func LogDownload(ctx *gin.Context) {
	name := ctx.Query("name")
	dateStr := ctx.Query("date")
	if name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
			"data": nil,
		})
		return
	}
	if !config.Exists(name) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人不存在",
			"data": nil,
		})
		return
	}

	// 默认当天
	var date time.Time
	if dateStr == "" {
		now := time.Now()
		// 只需要日期部分
		date = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		dateStr = now.Format("2006-01-02")
	} else {
		// 解析 YYYY-MM-DD
		t, err := time.ParseInLocation("2006-01-02", dateStr, time.Local)
		if err != nil {
			response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "日期格式错误，应为 YYYY-MM-DD")
			return
		}
		date = t
	}

	// 获取日志文件路径
	logPath := config.GetBotLogByDate(name, date)
	if logPath == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "无法获取日志路径")
		return
	}
	if _, err := os.Stat(logPath); os.IsNotExist(err) {
		response.ResponseErrorWithMsg(ctx, http.StatusNotFound, http.StatusNotFound, "日志文件不存在")
		return
	}

	// 设置为下载附件
	filename := fmt.Sprintf("%s-%s.log", name, dateStr)
	ctx.FileAttachment(logPath, filename)
}
