package pipeline

import (
	"alemongo/src/logic"
	"alemongo/src/models"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// CreatePipeline 创建流水线
func CreatePipeline(ctx *gin.Context) {
	var req models.PipelineCreateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "请求参数无效: " + err.Error(),
			"data": nil,
		})
		return
	}

	// 获取当前用户
	username, exists := ctx.Get("username")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"code": http.StatusUnauthorized,
			"msg":  "未授权",
			"data": nil,
		})
		return
	}

	pipeline, err := logic.CreatePipeline(&req, username.(string))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  err.Error(),
			"data": nil,
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "创建成功",
		"data": pipeline,
	})
}

// GetPipeline 获取流水线
func GetPipeline(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "无效的流水线ID",
			"data": nil,
		})
		return
	}

	pipeline, err := logic.GetPipeline(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{
			"code": http.StatusNotFound,
			"msg":  err.Error(),
			"data": nil,
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "获取成功",
		"data": pipeline,
	})
}

// GetPipelines 获取流水线列表
func GetPipelines(ctx *gin.Context) {
	limitStr := ctx.DefaultQuery("limit", "20")
	offsetStr := ctx.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	pipelines, err := logic.GetPipelines(limit, offset)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  err.Error(),
			"data": nil,
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "获取成功",
		"data": pipelines,
	})
}

// UpdatePipeline 更新流水线
func UpdatePipeline(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "无效的流水线ID",
			"data": nil,
		})
		return
	}

	var req models.PipelineUpdateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "请求参数无效: " + err.Error(),
			"data": nil,
		})
		return
	}

	err = logic.UpdatePipeline(uint(id), &req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  err.Error(),
			"data": nil,
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "更新成功",
		"data": nil,
	})
}

// DeletePipeline 删除流水线
func DeletePipeline(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "无效的流水线ID",
			"data": nil,
		})
		return
	}

	err = logic.DeletePipeline(uint(id))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  err.Error(),
			"data": nil,
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "删除成功",
		"data": nil,
	})
}

// GetPipelineExecution 获取流水线执行记录
func GetPipelineExecution(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "无效的执行记录ID",
			"data": nil,
		})
		return
	}

	execution, err := logic.GetPipelineExecution(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{
			"code": http.StatusNotFound,
			"msg":  err.Error(),
			"data": nil,
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "获取成功",
		"data": execution,
	})
}

// GetPipelineExecutions 获取流水线执行记录列表
func GetPipelineExecutions(ctx *gin.Context) {
	pipelineIDStr := ctx.Param("id")
	pipelineID, err := strconv.ParseUint(pipelineIDStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "无效的流水线ID",
			"data": pipelineIDStr,
		})
		return
	}

	limitStr := ctx.DefaultQuery("limit", "20")
	offsetStr := ctx.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	executions, err := logic.GetPipelineExecutions(uint(pipelineID), limit, offset)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  err.Error(),
			"data": nil,
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "获取成功",
		"data": executions,
	})
}

// TriggerPipeline 手动触发流水线
func TriggerPipeline(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "无效的流水线ID",
			"data": nil,
		})
		return
	}

	// 获取当前用户
	username, exists := ctx.Get("username")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"code": http.StatusUnauthorized,
			"msg":  "未授权",
			"data": nil,
		})
		return
	}

	// 读取触发参数（可选）
	var triggerReq struct {
		Branch    string `json:"branch"`
		CommitMsg string `json:"commit_msg"`
	}
	_ = ctx.ShouldBindJSON(&triggerReq)

	// 获取流水线以便提供默认分支
	pl, _ := logic.GetPipeline(uint(id))
	branch := triggerReq.Branch
	if branch == "" && pl != nil {
		branch = pl.Branch
	}
	if branch == "" {
		branch = "main"
	}

	commitMsg := triggerReq.CommitMsg
	if commitMsg == "" {
		commitMsg = "手动触发流水线"
	}

	// 创建模拟的Webhook载荷
	payload := &models.WebhookPayload{
		Ref: "refs/heads/" + branch,
		Repository: struct {
			FullName string `json:"full_name"`
			CloneURL string `json:"clone_url"`
			SSHURL   string `json:"ssh_url"`
		}{
			FullName: func() string {
				if pl != nil {
					return pl.Repository
				}
				return ""
			}(),
			CloneURL: "",
			SSHURL:   "",
		},
		HeadCommit: struct {
			ID      string `json:"id"`
			Message string `json:"message"`
			Author  struct {
				Name  string `json:"name"`
				Email string `json:"email"`
			} `json:"author"`
		}{
			ID:      "manual-trigger",
			Message: commitMsg,
			Author: struct {
				Name  string `json:"name"`
				Email string `json:"email"`
			}{
				Name:  username.(string),
				Email: "",
			},
		},
		Pusher: struct {
			Name  string `json:"name"`
			Email string `json:"email"`
		}{
			Name:  username.(string),
			Email: "",
		},
	}

	execution, err := logic.ExecutePipeline(uint(id), payload, username.(string))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  err.Error(),
			"data": nil,
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "触发成功",
		"data": execution,
	})
}

// GenerateWebhookSecret 生成Webhook密钥
func GenerateWebhookSecret(ctx *gin.Context) {
	// 生成一个随机的32字节密钥
	secret := generateRandomSecret(32)

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "生成Webhook密钥成功",
		"data": gin.H{
			"secret": secret,
		},
	})
}

// generateRandomSecret 生成随机密钥
func generateRandomSecret(length int) string {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		// 如果随机数生成失败，使用时间戳作为备选
		return hex.EncodeToString([]byte("fallback-secret"))
	}
	return hex.EncodeToString(bytes)
}
