package user

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"

	"github.com/gin-gonic/gin"
)

// 获取用户信息
func List(ctx *gin.Context) {
	users := logic.GetUserList()

	// 把密码隐藏掉
	for i := 0; i < len(users); i++ {
		users[i].PassWord = "******"
	}
	response.ResponseSuccess(ctx, users)
}
