package user

import (
	"alemongo/src/apps/api/requests"
	"alemongo/src/users"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 获取用户信息
func List(ctx *gin.Context) {
	adminname, exists := requests.GetUserName(ctx)
	if !exists {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "错误请求",
			"data": nil,
		})
		return
	}
	if !users.IsSuperAdmin(adminname) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "权限不足",
			"data": nil,
		})
		return
	}

	user := users.GetList()
	// 把密码隐藏掉
	for i := 0; i < len(user); i++ {
		user[i].PassWord = "******"
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": user,
	})
}
