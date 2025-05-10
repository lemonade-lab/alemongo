package token

import (
	"alemongo/src/permission"
	"alemongo/src/users"

	"github.com/gin-gonic/gin"
)

// 检查权限
func Permission(ctx *gin.Context, mis int) string {
	// 读取用户信息
	username, exists := GetUserName(ctx)
	if !exists {
		return "用户不存在"
	}
	var userInfo users.User
	if users.IsSuperAdmin(username) {
		// 超级管理，直接通过
		return ""
	} else {
		user, exist := users.GetUserByUserName(username)
		if !exist {
			return "用户不存在"
		}
		userInfo = user
	}
	// 读取身份
	identity := userInfo.Identity
	ok := permission.CheckIdentityPermission(identity, mis)
	if !ok {
		return "权限不足"
	}
	return ""
}
