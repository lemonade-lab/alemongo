package receive

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type PushEvent struct {
	Ref string `json:"ref"`
	// 可以根据需要添加更多字段
}

// 为指定bot，指定 package 开启 github webhook 通知。
// 让push事件触发时。更新本地的代码。

// 订阅
func Subscribe(ctx *gin.Context) {
	botName := ctx.Query("bot_name")
	appName := ctx.Query("app_name")
	if botName == "" || appName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "bot_name 和 app_name 不能为空",
			"data": nil,
		})
		return
	}
}

// 取消订阅
func Unsubscribe(ctx *gin.Context) {
	botName := ctx.PostForm("bot_name")
	appName := ctx.PostForm("app_name")
	eventType := ctx.PostForm("event_type")
	branch := ctx.PostForm("branch")
	if botName == "" || appName == "" || eventType == "" || branch == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "bot_name、app_name、event_type 和 branch 不能为空",
			"data": nil,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "取消订阅成功",
		"data": nil,
	})
}

func POST(ctx *gin.Context) {
	var event PushEvent
	if err := ctx.ShouldBindJSON(&event); err != nil {
		ctx.JSON(http.StatusOK, gin.H{
			"code": http.StatusOK,
			"msg":  "无效的请求体",
			"data": nil,
		})
		return
	}
	// 识别 push 事件
	eventType := ctx.GetHeader("X-GitHub-Event")
	if eventType != "push" {
		ctx.JSON(http.StatusOK, gin.H{
			"code": http.StatusOK,
			"msg":  "不是 push 事件",
			"data": nil,
		})
		return
	}
	// 识别指定分支，例如 "refs/heads/main"

	// 如果分支，开启流水线通知。

	// 订阅push事件
	// 指定分支触发事件

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "检测到 main 分支的 push",
		"data": event.Ref,
	})
}
