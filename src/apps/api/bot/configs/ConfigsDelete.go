package botconfigs

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/paths"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func ConfigsDelete(ctx *gin.Context) {
	// form
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
	// 配置路径
	curPath := paths.GetConfigsPathByName(name)
	// 判断是否存在。
	if _, err := os.Stat(curPath); os.IsNotExist(err) {
		response.ResponseError(ctx, http.StatusOK, response.ConfigFileIsDeleted)
		//ctx.JSON(http.StatusOK, gin.H{
		//	"code": http.StatusOK,
		//	"msg":  "已被删除",
		//	"data": nil,
		//})
		return
	}
	// 删除文件
	err := os.Remove(curPath)
	if err != nil {
		response.ResponseError(ctx, http.StatusBadRequest, response.DeleteConfigFileFailed)
		//ctx.JSON(http.StatusBadRequest, gin.H{
		//	"code": http.StatusBadRequest,
		//	"msg":  "删除配置失败",
		//	"data": nil,
		//})
		return
	}
	// 删除成功
	response.ResponseSuccess(ctx, curPath)
	//ctx.JSON(http.StatusOK, gin.H{
	//	"code": http.StatusOK,
	//	"msg":  "配置成功",
	//	"data": curPath,
	//})
}
