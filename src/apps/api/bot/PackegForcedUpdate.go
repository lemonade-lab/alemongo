package bot

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logger"
	"alemongo/src/logic"
	"alemongo/src/settings"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap/zapcore"
	"net/http"
)

func PackegForcedUpdate(ctx *gin.Context) {
	name := ctx.PostForm("name")
	repo_name := ctx.PostForm("repo_name")
	branch_name := ctx.PostForm("branch_name")

	var l = new(zapcore.Level)
	if err := l.UnmarshalText([]byte(settings.Conf.Log.Level)); err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.ErrorLogLevel)
	}

	botLogger, err := logger.GetOrCreateBotLogger(name, *l)
	if err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.ErrorRobotLog)
	}
	botLoggerWriter := logger.NewRobotLoggerWriter(botLogger)

	if err := logic.PackegForcedUpdate(name, repo_name, branch_name, botLoggerWriter); err != nil {
		botLoggerWriter.RobotLogger.Error(err.Error())
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	response.ResponseSuccess(ctx, nil)
}
