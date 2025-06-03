package user

import (
	"alemongo/src/apps/api/requests"
	"alemongo/src/apps/api/response"
	"alemongo/src/users"
	"github.com/gin-gonic/gin"
	"net/http"
)

// DeleteUserHandler 删除用户的路由处理函数
func DeleteUserHandler(ctx *gin.Context) {
	adminname, exists := requests.GetUserName(ctx)
	if !exists {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "错误请求")
		return
	}
	if !users.IsSuperAdmin(adminname) {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "权限不足")
		return
	}

	username := ctx.Query("username")
	exist := users.ExistUserByUserName(username)
	if !exist {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "该用户不存在")
		return
	}
	ok := users.DeleteUserByUserName(username)
	if !ok {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "删除失败")
		return
	}
	response.ResponseSuccess(ctx, "删除成功")
}
