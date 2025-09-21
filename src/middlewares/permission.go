package middlewares

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"alemongo/src/permission"
	"net/http"

	"github.com/gin-gonic/gin"
)

// PermissionMiddleware 权限检查中间件
// 根据用户身份检查是否拥有指定权限
func PermissionMiddleware(requiredPermission int) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取用户名
		username, exists := c.Get("username")
		if !exists {
			response.ResponseErrorWithMsg(c, http.StatusUnauthorized, http.StatusUnauthorized, "未找到用户信息")
			c.Abort()
			return
		}

		usernameStr, ok := username.(string)
		if !ok {
			response.ResponseErrorWithMsg(c, http.StatusUnauthorized, http.StatusUnauthorized, "用户信息格式错误")
			c.Abort()
			return
		}

		// 获取用户信息
		user, exists := dao.GetUserByUserName(usernameStr)
		if !exists {
			// 检查是否为临时超级管理员
			if dao.IsTemporarySuperAdmin(usernameStr) {
				// 临时超级管理员拥有所有权限
				c.Next()
				return
			}
			// 用户不存在
			response.ResponseErrorWithMsg(c, http.StatusUnauthorized, http.StatusUnauthorized, "用户不存在")
			c.Abort()
			return
		}

		// 检查是否为超级管理员
		if user.Identity == permission.IdentitySuperAdmin {
			// 超级管理员拥有所有权限
			c.Next()
			return
		}

		// 检查用户权限
		userPermissions := permission.GetPermissionsByIdentity(user.Identity)
		if !permission.CheckPermission(userPermissions, requiredPermission) {
			response.ResponseErrorWithMsg(c, http.StatusForbidden, http.StatusForbidden, "权限不足")
			c.Abort()
			return
		}

		c.Next()
	}
}

// SuperAdminOnlyMiddleware 仅超级管理员可访问的中间件
func SuperAdminOnlyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		username, exists := c.Get("username")
		if !exists {
			response.ResponseErrorWithMsg(c, http.StatusUnauthorized, http.StatusUnauthorized, "未找到用户信息")
			c.Abort()
			return
		}

		usernameStr, ok := username.(string)
		if !ok {
			response.ResponseErrorWithMsg(c, http.StatusUnauthorized, http.StatusUnauthorized, "用户信息格式错误")
			c.Abort()
			return
		}

		// 获取用户信息
		user, exists := dao.GetUserByUserName(usernameStr)
		if !exists {
			// 检查是否为临时超级管理员
			if dao.IsTemporarySuperAdmin(usernameStr) {
				// 临时超级管理员可以访问
				c.Next()
				return
			}
			// 用户不存在
			response.ResponseErrorWithMsg(c, http.StatusUnauthorized, http.StatusUnauthorized, "用户不存在")
			c.Abort()
			return
		}

		// 检查是否为超级管理员
		if user.Identity != permission.IdentitySuperAdmin {
			response.ResponseErrorWithMsg(c, http.StatusForbidden, http.StatusForbidden, "仅超级管理员可访问")
			c.Abort()
			return
		}

		c.Next()
	}
}

// AdminOrSuperAdminMiddleware 管理员或超级管理员可访问的中间件
func AdminOrSuperAdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		username, exists := c.Get("username")
		if !exists {
			response.ResponseErrorWithMsg(c, http.StatusUnauthorized, http.StatusUnauthorized, "未找到用户信息")
			c.Abort()
			return
		}

		usernameStr, ok := username.(string)
		if !ok {
			response.ResponseErrorWithMsg(c, http.StatusUnauthorized, http.StatusUnauthorized, "用户信息格式错误")
			c.Abort()
			return
		}

		// 获取用户信息
		user, exists := dao.GetUserByUserName(usernameStr)
		if !exists {
			// 检查是否为临时超级管理员
			if dao.IsTemporarySuperAdmin(usernameStr) {
				// 临时超级管理员可以访问
				c.Next()
				return
			}
			// 用户不存在
			response.ResponseErrorWithMsg(c, http.StatusUnauthorized, http.StatusUnauthorized, "用户不存在")
			c.Abort()
			return
		}

		// 检查是否为超级管理员或管理员
		if user.Identity == permission.IdentitySuperAdmin || user.Identity == permission.IdentityAdmin {
			c.Next()
			return
		}

		response.ResponseErrorWithMsg(c, http.StatusForbidden, http.StatusForbidden, "仅管理员可访问")
		c.Abort()
	}
}
