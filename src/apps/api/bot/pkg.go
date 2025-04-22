package bot

import (
	"alemongo/src/alemonjs"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// 获得指定名机器人的信息
func Package(ctx *gin.Context) {
	name := ctx.PostForm("name")
	if name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
			"data": nil,
		})
		return
	}
	if !alemonjs.Exists(name) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人不存在",
			"data": nil,
		})
		return
	}

	pkgPath := alemonjs.GetBotPKGPath(name)
	if _, err := os.Stat(pkgPath); os.IsNotExist(err) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人包不存在",
			"data": nil,
		})
		return
	}
	// 读取包文件
	data, err := os.ReadFile(pkgPath)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "读取包文件失败",
			"data": nil,
		})
		return
	}
	// 返回字符串
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "获取成功",
		"data": string(data),
	})
	return
}
