package bot

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// method: DELETE
// 删除指定名机器人
func Delete(ctx *gin.Context) {
	name := ctx.PostForm("name")
	log.Printf("删除机器人: %s", name)
	botPath, err := logic.DeleteBot(name)
	if err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	//ctx.JSON(http.StatusOK, gin.H{
	//	"code": http.StatusOK,
	//	"msg":  "机器人删除成功",
	//	"data": botPath,
	//})
	response.ResponseSuccessWithMsg(ctx, botPath, "机器人删除成功")
}
