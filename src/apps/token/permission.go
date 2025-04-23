package token

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// 输入最低权限。如果没有传入，则默认是预览权限。

// 中间件
func Permission(ctx *gin.Context) {
	// 得到 authorization
	authorization := ctx.GetHeader("authorization")
	// 判断是否有token
	if authorization == "" || !strings.HasPrefix(authorization, "Bearer ") {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "无效token",
			"data": ctx.Request.Header,
		})
		ctx.Abort()
		return
	}

	// 得到token
	tokenValue := strings.Split(authorization, " ")[1]

	// 验证token
	claims, err := Verify(tokenValue)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "失效token",
			"data": ctx.Request.Header,
		})
		ctx.Abort()
		return
	}

	// 设置token
	ctx.Set("token", tokenValue)

	// 将username存储到上下文
	ctx.Set("username", claims.Username)

	//放行
	ctx.Next()
}
