package system

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/core/tasks"
	"alemongo/src/logic"
	"alemongo/src/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CheckDependencies GET /system/deps/check
// @Summary 检测系统依赖
// @Description 检测 chrome/git/nvm/node 是否安装，并给出安装脚本建议
// @Tags 系统
// @Accept json
// @Produce json
// @Param names query []string false "依赖名称列表，如 chrome,git,nvm,node"
// @Success 200 {object} response.ResponseData{data=models.DepCheckResponse}
// @Router /system/deps/check [get]
func CheckDependencies(c *gin.Context) {
	names := c.QueryArray("names")
	res := logic.CheckDependencies(names)
	response.ResponseSuccess(c, res)
}

// PlanInstall POST /system/deps/install
// @Summary 生成依赖安装计划
// @Description 根据依赖名称生成安装命令（默认仅生成，不执行）
// @Tags 系统
// @Accept json
// @Produce json
// @Param body body models.DepInstallRequest true "安装请求"
// @Success 200 {object} response.ResponseData{data=models.DepInstallResponse}
// @Failure 400 {object} response.ResponseData
// @Router /system/deps/install [post]
func PlanInstall(c *gin.Context) {
	var req models.DepInstallRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "参数错误")
		return
	}
	res := logic.PlanInstall(req)
	// 若请求要求执行，这里创建任务（默认仍然建议先预览脚本）
	if req.Execute {
		// flatten commands (prefer override when provided)
		commands := make([]string, 0)
		if len(req.CommandsOverride) > 0 {
			for _, name := range req.Names {
				if arr, ok := req.CommandsOverride[name]; ok {
					commands = append(commands, arr...)
				}
			}
		}
		if len(commands) == 0 {
			for _, arr := range res.PlannedCommands {
				commands = append(commands, arr...)
			}
		}
		if len(commands) == 0 {
			response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "无可执行的安装命令")
			return
		}
		t := tasks.Default().CreateTask("install", commands)
		res.Executed = true
		res.TaskID = t.ID
		res.Message = "安装任务已创建，可前往任务中心查看进度"
	}
	response.ResponseSuccess(c, res)
}
