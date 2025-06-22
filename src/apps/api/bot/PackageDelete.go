package bot

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logger"
	"alemongo/src/logic"
	"alemongo/src/settings"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap/zapcore"
)

func PackageDelete(ctx *gin.Context) {
	// 获取机器人name和对应的git扩展name
	name := ctx.Query("name")
	app_name := ctx.Query("app_name")

	var l = new(zapcore.Level)
	if err := l.UnmarshalText([]byte(settings.Conf.Log.Level)); err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.ErrorLogLevel)
	}

	botLogger, err := logger.GetOrCreateBotLogger(name, *l)
	if err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.ErrorRobotLog)
	}
	botLoggerWriter := logger.NewRobotLoggerWriter(botLogger)

	err = logic.PackageDelete(name, app_name)
	if err != nil {
		botLoggerWriter.RobotLogger.Error(err.Error())
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	response.ResponseSuccess(ctx, nil)
}
