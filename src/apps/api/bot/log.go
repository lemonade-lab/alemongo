package bot

import (
	"alemongo/src/logic"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// 获得指定名机器人的信息
func Log(ctx *gin.Context) {
	name := ctx.PostForm("name")
	if name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
			"data": nil,
		})
		return
	}
	if !logic.Exists(name) {
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
	logPath := logic.GetBotLogByDate(name, date)
	if logPath == "" {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "无法获取日志路径",
			"data": nil,
		})
		return
	}
	// 不存在
	if _, err := os.Stat(logPath); os.IsNotExist(err) {
		ctx.JSON(http.StatusOK, gin.H{
			"code": http.StatusOK,
			"msg":  "请求成功",
			"data": "",
		})
		return
	}
	logData, err := os.ReadFile(logPath)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "无法读取日志文件",
			"data": nil,
		})
		return
	}
	// 按换行符分割日志
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": string(logData),
	})
}
