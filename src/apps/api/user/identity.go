package user

import (
	"alemongo/src/apps/api/requests"
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"alemongo/src/permission"
	"net/http"

	"github.com/gin-gonic/gin"
)

// method: PUT
func Identity(ctx *gin.Context) {
	identity := ctx.PostForm("identity")
	if identity == "" {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "身份不能为空")
		return
	}
	exist := permission.ExistIdentity(identity)
	if !exist {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "参数错误")
		return
	}
	username := ctx.PostForm("username")

	// 获取当前登录用户
	currentUser, exists := requests.GetUserName(ctx)
	if !exists {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "获取当前用户失败")
		return
	}

	// 禁止用户修改自己的身份
	if currentUser == username {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "禁止修改自己的身份",
			"data": nil,
		})
		return
	}

	user, exist := dao.GetUserByUserName(username)
	if !exist {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "用户不存在",
			"data": nil,
		})
		return
	}

	// 检查当前用户是否为超级管理员
	currentUserInfo, currentUserExists := dao.GetUserByUserName(currentUser)
	var currentUserIsSuperAdmin bool
	if currentUserExists {
		currentUserIsSuperAdmin = currentUserInfo.Identity == permission.IdentitySuperAdmin
	} else {
		// 检查是否为临时超级管理员
		currentUserIsSuperAdmin = dao.IsTemporarySuperAdmin() && currentUser == dao.GetAdmin().UserName
	}

	// 检查目标用户是否为超级管理员
	targetUserIsSuperAdmin := user.Identity == permission.IdentitySuperAdmin

	// 如果目标用户是超级管理员，只有超级管理员才能修改
	if targetUserIsSuperAdmin && !currentUserIsSuperAdmin {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "只有超级管理员才能修改超级管理员身份",
			"data": nil,
		})
		return
	}

	// 如果要将用户设置为超级管理员，只有超级管理员才能操作
	if identity == permission.IdentitySuperAdmin && !currentUserIsSuperAdmin {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "只有超级管理员才能设置用户为超级管理员",
			"data": nil,
		})
		return
	}
	ok := dao.SetUserIdentityByUserName(user.UserName, identity)
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "修改失败",
			"data": nil,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "请求成功",
		"data": nil,
	})
	ctx.Abort()
}

// method: Get
func IdentityList(ctx *gin.Context) {
	ctx.JSON(200, gin.H{
		"code": 200,
		"msg":  "获取成功",
		"data": permission.Identities,
	})
	ctx.Abort()
}
