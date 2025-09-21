package apiemail

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"alemongo/src/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func UpdateEmail(ctx *gin.Context) {
	var emailConfig models.EmailConfig
	if err := ctx.ShouldBind(&emailConfig); err != nil {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "参数有误")
		return
	}
	if err := logic.EditEmailConfig(emailConfig); err != nil {
		zap.L().Error(err.Error())
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, "系统错误，修改邮箱配置失败")
		return
	}
	response.ResponseSuccess(ctx, nil)
}

func GetEmail(ctx *gin.Context) {
	emailConfig, err := logic.GetEmailConfig()
	if err != nil {
		zap.L().Error(err.Error())
		response.ResponseErrorWithMsg(ctx, http.StatusInternalServerError, http.StatusInternalServerError, "系统错误，获取邮箱配置失败")
		return
	}
	response.ResponseSuccess(ctx, emailConfig)
}
