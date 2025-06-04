package user

import (
	"alemongo/src/apps/api/requests"
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"alemongo/src/logic"

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
	if !dao.IsSuperAdmin(adminname) {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "权限不足")
		return
	}
	username := ctx.Query("username")
	if err := logic.DeleteUser(username); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "删除失败")
		return
	}
	response.ResponseSuccess(ctx, "删除成功")
}
