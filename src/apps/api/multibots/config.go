package multibots

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/paths"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"path/filepath"
)

// @summary 添加多配置机器人配置
// @description 添加多配置机器人配置
// @tags 机器人
// @accept x-www-form-urlencoded
// @produce json
// @param bot_name formData string true "机器人名"
// @param name formData string true "配置名"
// @param content formData string true "配置内容"
// @success 200 {object} response.ResponseData{data=string} "添加成功"
// @failure 400 {object} response.ResponseData "参数错误"
// @failure 500 {object} response.ResponseData "添加失败"
// @router /api/v1/bot/addconfig [post]
func AddBotConfig(c *gin.Context) {
	botName := c.PostForm("bot_name")
	name := c.PostForm("name")
	if name == "" {
		response.ResponseError(c, http.StatusBadRequest, response.ConfigNameIsEmpty)
		return
	}
	if botName == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot_name is empty")
		return
	}
	content := c.PostForm("content")
	if content == "" {
		response.ResponseError(c, http.StatusBadRequest, response.ConfigContentIsEmpty)
		return
	}
	multiBotConfigPath := paths.GetMultiBotConfigPath(botName)
	curPath := filepath.Join(multiBotConfigPath, fmt.Sprintf("%s.yaml", name))
	err := os.WriteFile(curPath, []byte(content), 0644)
	if err != nil {
		response.ResponseError(c, http.StatusBadRequest, response.CreateConfigFailed)
		return
	}
	response.ResponseSuccess(c, curPath)
}
