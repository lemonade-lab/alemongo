package multibots

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	config "alemongo/src/paths"
	"github.com/gin-gonic/gin"
	"net/http"
)

// @summary 创建多配置机器人
// @description 创建多配置机器人
// @tags 机器人
// @accept x-www-form-urlencoded
// @produce json
// @param name formData string true "机器人名"
// @success 200 {object} response.ResponseData{data=string} "创建成功"
// @failure 400 {object} response.ResponseData "参数错误"
// @failure 500 {object} response.ResponseData "创建失败"
// @router /api/v1/bot/create/multi [post]
func CreateMultiConfigBot(c *gin.Context) {
	name := c.PostForm("name")
	if name == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, response.RobotNameIsEmpty, "机器人名不能为空")
	}

	targetPath, err := logic.CreateMultiBot(name)
	if err != response.CodeSuccess {
		response.ResponseError(c, http.StatusInternalServerError, err)
		return
	}
	response.ResponseSuccess(c, targetPath)
}

// @summary 启动多配置机器人
// @description 启动多配置机器人
// @tags 机器人
// @accept x-www-form-urlencoded
// @produce json
// @param name formData string true "机器人名"
// @success 200 {object} response.ResponseData{data=string} "启动成功"
// @failure 400 {object} response.ResponseData "参数错误"
// @failure 500 {object} response.ResponseData "启动失败"
// @router /api/v1/bot/start/multi [post]
func StartMultiBot(c *gin.Context) {
	name := c.PostForm("name")
	if name == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, response.RobotNameIsEmpty, "机器人名不能为空")
		return
	}
	// 读取对应配置，启动机器人
	if !config.MultiBotExists(name) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "多配置机器人不存在")
		return
	}
	msg, err := logic.RunMultiBot(name)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, msg)
		return
	}
	response.ResponseSuccess(c, "启动成功")
}
