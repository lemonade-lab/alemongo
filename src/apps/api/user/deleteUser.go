package user

import (
	"alemongo/src/apps/api/requests"
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"alemongo/src/logic"
	"alemongo/src/permission"

	"net/http"

	"github.com/gin-gonic/gin"
)

// DeleteUserHandler 删除用户的路由处理函数
func DeleteUserHandler(ctx *gin.Context) {
	// 获取当前登录用户
	adminname, exists := requests.GetUserName(ctx)
	if !exists {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "错误请求")
		return
	}

	username := ctx.PostForm("username")

	// 禁止用户删除自己
	if adminname == username {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "禁止删除自己")
		return
	}

	// 检查当前用户是否为超级管理员
	currentUserInfo, currentUserExists := dao.GetUserByUserName(adminname)
	var currentUserIsSuperAdmin bool
	if currentUserExists {
		currentUserIsSuperAdmin = currentUserInfo.Identity == permission.IdentitySuperAdmin
	} else {
		// 检查是否为临时超级管理员
		currentUserIsSuperAdmin = dao.IsTemporarySuperAdmin() && adminname == dao.GetAdmin().UserName
	}

	// 检查目标用户是否为超级管理员
	targetUserInfo, targetUserExists := dao.GetUserByUserName(username)
	var targetUserIsSuperAdmin bool
	if targetUserExists {
		targetUserIsSuperAdmin = targetUserInfo.Identity == permission.IdentitySuperAdmin
	}

	// 如果目标用户是超级管理员，只有超级管理员才能删除
	if targetUserIsSuperAdmin && !currentUserIsSuperAdmin {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "只有超级管理员才能删除超级管理员")
		return
	}

	if err := logic.DeleteUser(username); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "删除失败")
		return
	}
	response.ResponseSuccess(ctx, "删除成功")
}
