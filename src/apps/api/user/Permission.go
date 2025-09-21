package user

import (
	"alemongo/src/apps/api/requests"
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"alemongo/src/permission"

	"github.com/gin-gonic/gin"
)

// method: PUT
func Permission(ctx *gin.Context) {
	username, exists := requests.GetUserName(ctx)
	if !exists {
		response.ResponseErrorWithMsg(ctx, 200, 200, "用户不存在")
		ctx.Abort()
		return
	}
	user, exist := dao.GetUserByUserName(username)
	if !exist {
		// 检查是否为临时超级管理员
		if dao.IsTemporarySuperAdmin() && username == dao.GetAdmin().UserName {
			// 临时超级管理员，返回 1
			ctx.JSON(200, gin.H{
				"code": 200,
				"msg":  "超级用户",
				// 表示 超级用户
				"data": 1,
			})
			return
		}
		ctx.JSON(200, gin.H{
			"code": 200,
			"msg":  "用户不存在",
			"data": nil,
		})
		ctx.Abort()
		return
	}

	// 检查是否为超级管理员
	if user.Identity == permission.IdentitySuperAdmin {
		// 超级用户。返回 1
		ctx.JSON(200, gin.H{
			"code": 200,
			"msg":  "超级用户",
			// 表示 超级用户
			"data": 1,
		})
		return
	}

	// 普通用户，返回权限映射
	data := permission.GetPermissionsByIdentityMap(user.Identity)
	ctx.JSON(200, gin.H{
		"code": 200,
		"msg":  "获取权限成功",
		"data": data,
	})
}
