package user

import (
	"alemongo/src/apps/token"
	"alemongo/src/users"
	"net/http"

	"github.com/gin-gonic/gin"
)

// method: DELETE
func Delete(ctx *gin.Context) {
	adminname, exists := token.GetUserName(ctx)
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

	username := ctx.Query("username")
	exist := users.ExistUserByUserName(username)
	if !exist {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "该用户不存在",
			"data": nil,
		})
		return
	}
	ok := users.DeleteUserByUserName(username)
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "删除失败",
			"data": nil,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": nil,
	})
}
