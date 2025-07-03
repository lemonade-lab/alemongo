package botconfigs

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/paths"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func ConfigsUpdate(ctx *gin.Context) {
	name := ctx.PostForm("name")
	if name == "" {
		response.ResponseError(ctx, http.StatusBadRequest, response.ConfigNameIsEmpty)
		//ctx.JSON(http.StatusBadRequest, gin.H{
		//	"code": http.StatusBadRequest,
		//	"msg":  "配置名不能为空",
		//	"data": nil,
		//})
		return
	}
	content := ctx.PostForm("content")
	if content == "" {
		response.ResponseError(ctx, http.StatusBadRequest, response.ConfigContentIsEmpty)
		//ctx.JSON(http.StatusBadRequest, gin.H{
		//	"code": http.StatusBadRequest,
		//	"msg":  "配置内容不能为空",
		//	"data": nil,
		//})
		return
	}
	// 配置路径
	curPath := paths.GetConfigsPathByName(name)
	// 把数据写入该文件
	err := os.WriteFile(curPath, []byte(content), 0644)
	if err != nil {
		response.ResponseError(ctx, http.StatusBadRequest, response.CreateConfigFailed)
		//ctx.JSON(http.StatusBadRequest, gin.H{
		//	"code": http.StatusBadRequest,
		//	"msg":  "配置失败",
		//	"data": nil,
		//})
		return
	}

	response.ResponseSuccess(ctx, curPath)
	//ctx.JSON(http.StatusOK, gin.H{
	//	"code": http.StatusOK,
	//	"msg":  "配置成功",
	//	"data": curPath,
	//})
}
