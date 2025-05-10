package user

import (
	"alemongo/src/apps/token"
	"alemongo/src/permission"
	"alemongo/src/users"

	"github.com/gin-gonic/gin"
)

// method: PUT
func Permission(ctx *gin.Context) {
	username, exists := token.GetUserName(ctx)
	if !exists {
		ctx.JSON(200, gin.H{
			"code": 200,
			"msg":  "用户不存在",
			"data": nil,
		})
		ctx.Abort()
		return
	}
	if users.IsSuperAdmin(username) {
		// 超级用户。返回 1
		ctx.JSON(200, gin.H{
			"code": 200,
			"msg":  "超级用户",
			// 表示 超级用户
			"data": 1,
		})
		return
	} else {
		user, exist := users.GetUserByUserName(username)
		if !exist {
			ctx.JSON(200, gin.H{
				"code": 200,
				"msg":  "用户不存在",
				"data": nil,
			})
			ctx.Abort()
			return
		}
		data := permission.GetPermissionsByIdentityMap(user.Identity)
		ctx.JSON(200, gin.H{
			"code": 200,
			"msg":  "超级用户",
			"data": data,
		})
	}
}
