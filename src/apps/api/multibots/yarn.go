package multibots

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"net/http"

	"github.com/gin-gonic/gin"
)

// YarnInstall 多配置机器人安装依赖
func YarnInstall(c *gin.Context) {
	name := c.PostForm("name")
	msg, err := logic.MultiBotYarnInstall(name)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	response.ResponseSuccessWithMsg(c, err, msg)
}
