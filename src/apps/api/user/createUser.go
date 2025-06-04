package user

import (
	"alemongo/src/apps/api/requests"
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"alemongo/src/logic"
	"alemongo/src/models"
	"alemongo/src/permission"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"net/http"
)

// CreateHandler 创建用户的路由处理函数
func CreateUserHandler(ctx *gin.Context) {
	// 只有管理员才可以创建新用户
	adminname, exists := requests.GetUserName(ctx)
	if !exists {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "错误请求")
		return
	}
	if !dao.IsSuperAdmin(adminname) {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "权限不足")
		return
	}
	// 获取参数，并进行校验
	user := new(models.User)
	if err := ctx.ShouldBind(user); err != nil {
		zap.L().Debug("ctx.ShouldBind(user) error", zap.Error(err))
		zap.L().Error("create user with invalid param", zap.Error(err))
		response.ResponseError(ctx, http.StatusBadRequest, response.CodeInvalidParam)
		return
	}
	existIdentity := permission.ExistIdentity(user.Identity)
	if !existIdentity {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "参数错误")
		return
	}

	// 业务处理
	if err := logic.CreateUser(user); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "创建用户失败")
		return
	}
	// 创建成功
	response.ResponseSuccess(ctx, nil)
}
