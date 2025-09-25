package notification

import (
	"alemongo/src/apps/api/requests"
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"alemongo/src/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ListNotifications 请求参数：status, page, page_size
func ListNotifications(ctx *gin.Context) {
	username, ok := requests.GetUserName(ctx)
	if !ok {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "未获取到用户")
		return
	}
	status := ctx.Query("status") // 可选: unread/read/空
	pageStr := ctx.Query("page")
	sizeStr := ctx.Query("page_size")
	page, _ := strconv.Atoi(pageStr)
	if page <= 0 {
		page = 1
	}
	size, _ := strconv.Atoi(sizeStr)
	if size <= 0 || size > 100 {
		size = 20
	}
	offset := (page - 1) * size
	list, total, err := dao.ListNotifications(username, status, size, offset)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
		return
	}
	response.ResponseSuccess(ctx, gin.H{"list": list, "total": total, "page": page, "page_size": size})
}

// UnreadCount 未读数量
func UnreadCount(ctx *gin.Context) {
	username, ok := requests.GetUserName(ctx)
	if !ok {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "未获取到用户")
		return
	}
	c, err := dao.CountUnreadNotifications(username)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
		return
	}
	response.ResponseSuccess(ctx, gin.H{"unread": c})
}

// MarkRead 设为已读（单条）
func MarkRead(ctx *gin.Context) {
	username, ok := requests.GetUserName(ctx)
	if !ok {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "未获取到用户")
		return
	}
	idStr := ctx.Param("id")
	id64, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "id 无效")
		return
	}
	if err := dao.MarkNotificationRead(uint(id64), username); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
		return
	}
	// 推送单条已读 & 未读数
	pushRead(username, uint(id64))
	pushUnread(username)
	response.ResponseSuccess(ctx, gin.H{"id": id64, "status": "read"})
}

// MarkAllRead 全部设为已读
func MarkAllRead(ctx *gin.Context) {
	username, ok := requests.GetUserName(ctx)
	if !ok {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "未获取到用户")
		return
	}
	if err := dao.MarkAllNotificationsRead(username); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
		return
	}
	pushReadAll(username)
	pushUnread(username)
	response.ResponseSuccess(ctx, gin.H{"status": "all_read"})
}

// CreateNotification 手动创建（仅超级管理员） body: {type,title,content,extra}
func CreateNotification(ctx *gin.Context) {
	username, ok := requests.GetUserName(ctx)
	if !ok {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "未获取到用户")
		return
	}
	var req struct {
		UserName string `json:"userName"` // 可指定，否则默认自己
		Type     string `json:"type"`
		Title    string `json:"title"`
		Content  string `json:"content"`
		Extra    string `json:"extra"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "请求体无效")
		return
	}
	if req.UserName == "" {
		req.UserName = username
	}
	n := &models.Notification{UserName: req.UserName, Type: req.Type, Title: req.Title, Content: req.Content, Extra: req.Extra}
	if err := dao.CreateNotification(n); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
		return
	}
	pushNew(n.UserName, n)
	pushUnread(n.UserName)
	response.ResponseSuccess(ctx, gin.H{"created": true})
}

// DeleteNotification 删除
func DeleteNotification(ctx *gin.Context) {
	username, ok := requests.GetUserName(ctx)
	if !ok {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "未获取到用户")
		return
	}
	idStr := ctx.Param("id")
	id64, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "id 无效")
		return
	}
	if err := dao.DeleteNotification(uint(id64), username); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, err.Error())
		return
	}
	pushDelete(username, uint(id64))
	pushUnread(username)
	response.ResponseSuccess(ctx, gin.H{"deleted": id64})
}
