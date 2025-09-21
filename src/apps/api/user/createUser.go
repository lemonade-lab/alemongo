package user

import (
	"alemongo/src/apps/api/requests"
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"alemongo/src/logic"
	"alemongo/src/models"
	"alemongo/src/permission"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// CreateHandler 创建用户的路由处理函数
func CreateUserHandler(ctx *gin.Context) {
	// 获取参数，并进行校验
	user := new(models.User)
	if err := ctx.ShouldBind(user); err != nil {
		zap.L().Debug("ctx.ShouldBind(user) error", zap.Error(err))
		zap.L().Error("create user with invalid param", zap.Error(err))
		log.Println("参数绑定错误: ", err)
		response.ResponseError(ctx, http.StatusBadRequest, response.CodeInvalidParam)
		return
	}
	existIdentity := permission.ExistIdentity(user.Identity)
	if !existIdentity {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "参数错误")
		return
	}

	// 获取当前登录用户
	currentUser, exists := requests.GetUserName(ctx)
	if !exists {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "获取当前用户失败")
		return
	}

	// 检查当前用户是否为超级管理员
	currentUserInfo, currentUserExists := dao.GetUserByUserName(currentUser)
	var currentUserIsSuperAdmin bool
	if currentUserExists {
		currentUserIsSuperAdmin = currentUserInfo.Identity == permission.IdentitySuperAdmin
	} else {
		// 检查是否为临时超级管理员
		currentUserIsSuperAdmin = dao.IsTemporarySuperAdmin(currentUser)
	}

	// 如果要将用户设置为超级管理员，只有超级管理员才能操作
	if user.Identity == permission.IdentitySuperAdmin && !currentUserIsSuperAdmin {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "只有超级管理员才能创建超级管理员")
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
