package system

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/core/tasks"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ListTasks GET /system/tasks
// @Summary 任务列表
// @Tags 系统
// @Produce json
// @Success 200 {object} response.ResponseData
// @Router /system/tasks [get]
func ListTasks(c *gin.Context) {
	data := tasks.Default().List()
	response.ResponseSuccess(c, data)
}

// GetTask GET /system/tasks/:id
// @Summary 任务详情
// @Tags 系统
// @Produce json
// @Param id path string true "任务ID"
// @Success 200 {object} response.ResponseData
// @Failure 404 {object} response.ResponseData
// @Router /system/tasks/{id} [get]
func GetTask(c *gin.Context) {
	id := c.Param("id")
	t := tasks.Default().Get(id)
	if t == nil {
		response.ResponseErrorWithMsg(c, http.StatusNotFound, http.StatusNotFound, "任务不存在")
		return
	}
	response.ResponseSuccess(c, t)
}

// CancelTask POST /system/tasks/:id/cancel
// @Summary 取消任务
// @Tags 系统
// @Produce json
// @Param id path string true "任务ID"
// @Success 200 {object} response.ResponseData
// @Failure 404 {object} response.ResponseData
// @Router /system/tasks/{id}/cancel [post]
func CancelTask(c *gin.Context) {
	id := c.Param("id")
	ok := tasks.Default().Cancel(id)
	if !ok {
		response.ResponseErrorWithMsg(c, http.StatusNotFound, http.StatusNotFound, "任务不存在或不可取消")
		return
	}
	response.ResponseSuccess(c, gin.H{"id": id, "canceled": true})
}
