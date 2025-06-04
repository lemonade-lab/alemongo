package user

import (
	"alemongo/src/apps/api/requests"
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"alemongo/src/logic"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 获取用户信息
func List(ctx *gin.Context) {
	adminname, exists := requests.GetUserName(ctx)
	if !exists {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "错误请求")
		return
	}
	if !dao.IsSuperAdmin(adminname) {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "权限不足")
		return
	}
	users := logic.GetUserList()

	// 把密码隐藏掉
	for i := 0; i < len(users); i++ {
		users[i].PassWord = "******"
	}
	response.ResponseSuccess(ctx, users)
}
