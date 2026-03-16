package multibots

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"net/http"

	"github.com/gin-gonic/gin"
)

// StartInstance 启动单个multibot实例
func StartInstance(c *gin.Context) {
	name := c.PostForm("name")
	configName := c.PostForm("config_name")
	if name == "" || configName == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "name 和 config_name 不能为空")
		return
	}
	msg, err := logic.StartMultiBotInstance(name, configName)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, msg)
		return
	}
	response.ResponseSuccess(c, msg)
}

// StopInstance 停止单个multibot实例
func StopInstance(c *gin.Context) {
	name := c.PostForm("name")
	configName := c.PostForm("config_name")
	if name == "" || configName == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "name 和 config_name 不能为空")
		return
	}
	msg, err := logic.StopMultiBotInstance(name, configName)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, msg)
		return
	}
	response.ResponseSuccess(c, msg)
}

// RestartInstance 重启单个multibot实例
func RestartInstance(c *gin.Context) {
	name := c.PostForm("name")
	configName := c.PostForm("config_name")
	if name == "" || configName == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "name 和 config_name 不能为空")
		return
	}
	msg, err := logic.RestartMultiBotInstance(name, configName)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, msg)
		return
	}
	response.ResponseSuccess(c, msg)
}
