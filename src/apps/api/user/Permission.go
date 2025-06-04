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
	if dao.IsSuperAdmin(username) {
		// 超级用户。返回 1
		ctx.JSON(200, gin.H{
			"code": 200,
			"msg":  "超级用户",
			// 表示 超级用户
			"data": 1,
		})
		return
	} else {
		user, exist := dao.GetUserByUserName(username)
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
