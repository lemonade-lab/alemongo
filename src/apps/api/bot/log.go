package bot

import (
	"alemongo/src/apps/api/response"
	config "alemongo/src/paths"
	"bufio"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// 获得指定名机器人的信息
func Log(ctx *gin.Context) {
	name := ctx.PostForm("name")
	pageStr := ctx.PostForm("page")
	pageSizeStr := ctx.PostForm("pageSize")
	if name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
			"data": nil,
		})
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
	if !config.Exists(name) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人不存在",
			"data": nil,
		})
		return
	}
	// 时间戳
	timestamp := ctx.PostForm("timestamp")
	var date time.Time
	if timestamp != "" {
		// 解析时间戳
		timestampInt, err := strconv.ParseInt(timestamp, 10, 64)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"code": http.StatusBadRequest,
				"msg":  "时间戳格式错误",
				"data": nil,
			})
			return
		}
		// 转换为时间（毫秒转秒）
		date = time.Unix(timestampInt/1000, (timestampInt%1000)*int64(time.Millisecond))
	} else {
		// 如果没有提供时间戳，使用当前时间
		date = time.Now()
	}
	// 获取日志路径
	logPath := config.GetBotLogByDate(name, date)
	if logPath == "" {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "无法获取日志路径",
			"data": nil,
		})
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
		} else {
			response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "打开日志文件失败")
			return
		}
	}
	defer logFile.Close()
	scanner := bufio.NewScanner(logFile)
	var logLines []string
	lineCount := 0
	startLine := (page - 1) * pageSize
	for scanner.Scan() {
		lineCount++
		if lineCount <= startLine {
			continue
		}
		if len(logLines) < pageSize {
			logLines = append(logLines, scanner.Text())
		} else {
			break
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
	// 按换行符分割日志
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": gin.H{
			"log":   string(logData),
			"count": lineCount,
		},
	})
}
