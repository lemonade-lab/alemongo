package user

import (
	"alemongo/src/apps/token"
	"alemongo/src/users"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// 登录失败缓存
var loginFailures = sync.Map{} // key: username, value: {count, lastFailedTime}

// 登录
func Login(ctx *gin.Context) {
	username := ctx.PostForm("username")
	password := ctx.PostForm("password")

	// 检查是否被锁定
	if locked, remainingTime := isAccountLocked(username); locked {
		ctx.JSON(http.StatusTooManyRequests, gin.H{
			"code": http.StatusTooManyRequests,
			"msg":  "账户已被锁定，请稍后再试",
			"data": gin.H{"remaining_time": remainingTime},
		})
		return
	}

	userInfo := users.User{}
	if users.IsSuperAdmin(username) {
		// 得到超级管理员信息
		userInfo = users.GetAdminAccount()
	} else {
		user, exist := users.GetUserByUserName(username)
		if !exist {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"code": http.StatusBadRequest,
				"msg":  "用户不存在",
				"data": nil,
			})
			return
		}
		userInfo = user
	}

	// 密码不对
	if password != userInfo.PassWord {
		recordLoginFailure(username)
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "密码错误",
			"data": nil,
		})
		return
	}

	// 登录成功，清除失败记录
	clearLoginFailures(username)

	// 生成 token
	tokenValue, err := token.Create(username)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "生成 token 失败",
			"data": nil,
		})
		return
	}

	// 反馈
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": tokenValue,
	})
}

// 记录登录失败
func recordLoginFailure(username string) {
	value, _ := loginFailures.LoadOrStore(username, struct {
		count          int
		lastFailedTime time.Time
	}{0, time.Now()})

	data := value.(struct {
		count          int
		lastFailedTime time.Time
	})
	data.count++
	data.lastFailedTime = time.Now()
	loginFailures.Store(username, data)
}

// 检查账户是否被锁定
func isAccountLocked(username string) (bool, int) {
	value, ok := loginFailures.Load(username)
	if !ok {
		return false, 0
	}

	data := value.(struct {
		count          int
		lastFailedTime time.Time
	})

	// 如果失败次数小于 5 次，不锁定
	if data.count < 5 {
		return false, 0
	}

	// 检查是否超过 5 分钟
	elapsed := time.Since(data.lastFailedTime)
	if elapsed < 5*time.Minute {
		remainingTime := int((5*time.Minute - elapsed).Seconds())
		return true, remainingTime
	}

	// 超过 5 分钟，清除记录
	loginFailures.Delete(username)
	return false, 0
}

// 清除登录失败记录
func clearLoginFailures(username string) {
	loginFailures.Delete(username)
}
