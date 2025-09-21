package user

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"

	"github.com/gin-gonic/gin"
)

// GetAdminStatus 获取超级管理员状态
// @Summary 获取超级管理员状态
// @Description 获取当前超级管理员的状态信息，包括是否为临时账户
// @Tags 用户管理
// @Accept json
// @Produce json
// @Success 200 {object} response.ResponseData{data=map[string]interface{}} "成功"
// @Failure 401 {object} response.ResponseData "未授权"
// @Router /user/admin-status [get]
func GetAdminStatus(ctx *gin.Context) {
	status := dao.GetSuperAdminStatus()
	response.ResponseSuccess(ctx, status)
}
