package user

import (
	"alemongo/src/apps/api/requests"
	"alemongo/src/apps/api/response"
	"alemongo/src/permission"
	"alemongo/src/users"
	"github.com/gin-gonic/gin"
	"net/http"
)

// CreateHandler 创建用户的路由处理函数
func CreateUserHandler(ctx *gin.Context) {
	adminname, exists := requests.GetUserName(ctx)
	if !exists {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "错误请求")
		return
	}
	if !users.IsSuperAdmin(adminname) {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "权限不足")
		return
	}
	identity := ctx.PostForm("identity")
	existIdentity := permission.ExistIdentity(identity)
	if !existIdentity {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "参数错误")
		return
	}
	username := ctx.PostForm("username")
	password := ctx.PostForm("password")
	if users.IsSuperAdmin(username) {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "该用户已注册")
		return
	}
	exist := users.ExistUserByUserName(username)
	if exist {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "该用户已被注册")
		return
	}
	ok := users.CreateUser(username, password, identity)
	if !ok {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "创建用户失败")
		return
	}
	response.ResponseSuccess(ctx, nil)
}
