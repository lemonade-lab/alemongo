package user

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/apps/token"
	"alemongo/src/permission"
	"alemongo/src/users"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 创建用户
func Create(ctx *gin.Context) {
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
	identity := ctx.PostForm("identity")
	existIdentity := permission.ExistIdentity(identity)
	if !existIdentity {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "参数错误",
			"data": nil,
		})
		return
	}
	username := ctx.PostForm("username")
	password := ctx.PostForm("password")
	if users.IsSuperAdmin(username) {
		// 和超级账户相同，不能创建
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "该用户已被注册",
			"data": nil,
		})
		return
	}
	exist := users.ExistUserByUserName(username)
	if exist {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "该用户已被注册",
			"data": nil,
		})
		return
	}
	ok := users.CreateUser(username, password, identity)
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "创建用户失败",
			"data": nil,
		})
		return
	}
	response.ResponseSuccess(ctx, nil)
	//ctx.JSON(http.StatusOK, gin.H{
	//	"code": http.StatusOK,
	//	"msg":  "请求成功",
	//	"data": nil,
	//})
}
