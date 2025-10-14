package pipeline

import (
	"alemongo/src/dao"
	"alemongo/src/logic"
	"alemongo/src/models"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// WebhookHandler 处理Webhook请求
func WebhookHandler(ctx *gin.Context) {
	// 获取事件类型
	eventType := ctx.GetHeader("X-GitHub-Event")
	if eventType == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "缺少 X-GitHub-Event 头部",
			"data": nil,
		})
		return
	}

	// 获取签名
	signature := ctx.GetHeader("X-Hub-Signature-256")
	if signature == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "缺少 X-Hub-Signature-256 头部",
			"data": nil,
		})
		return
	}

	// 读取请求体用于签名验证与解析（只能读取一次）
	body, err := ctx.GetRawData()
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "读取请求体失败: " + err.Error(),
			"data": nil,
		})
		return
	}

	// 解析Webhook载荷（从 body 反序列化，以避免重复读取）
	var payload models.WebhookPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "解析Webhook载荷失败: " + err.Error(),
			"data": nil,
		})
		return
	}

	// 验证签名
	if !verifyWebhookSignature(body, signature, payload.Repository.FullName) {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"code": http.StatusUnauthorized,
			"msg":  "Webhook签名验证失败",
			"data": nil,
		})
		return
	}

	// 支持的事件类型
	supportedEvents := map[string]bool{
		"push":                true,
		"pull_request":        true,
		"pull_request_review": true,
		"issues":              true,
		"issue_comment":       true,
		"release":             true,
		"create":              true,
		"delete":              true,
		"workflow_run":        true,
		"schedule":            true,
	}

	// 检查是否支持该事件类型
	if !supportedEvents[eventType] {
		ctx.JSON(http.StatusOK, gin.H{
			"code": http.StatusOK,
			"msg":  fmt.Sprintf("不支持的事件类型: %s", eventType),
			"data": nil,
		})
		return
	}

	// 触发流水线
	err = logic.TriggerPipelineByWebhook(&payload, eventType)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "触发流水线失败: " + err.Error(),
			"data": nil,
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "Webhook处理成功",
		"data": nil,
	})
}

// verifyWebhookSignature 验证Webhook签名
func verifyWebhookSignature(payload []byte, signature, repository string) bool {
	// 获取仓库的webhook密钥
	secret, err := getWebhookSecret(repository)
	if err != nil {
		// 如果获取密钥失败，拒绝请求(安全第一)
		fmt.Printf("获取webhook密钥失败: repository=%s, error=%v\n", repository, err)
		return false // ✅ 修复: 拒绝未验证的请求
	}

	if secret == "" {
		// 如果没有配置密钥,拒绝请求(安全第一)
		fmt.Printf("警告: 仓库 %s 未配置webhook密钥,拒绝请求\n", repository)
		return false // ✅ 修复: 拒绝未验证的请求
	}

	return verifySignature(payload, signature, secret)
}

// getWebhookSecret 获取仓库的webhook密钥
func getWebhookSecret(repository string) (string, error) {
	// 从数据库直接查询该仓库的所有激活流水线,不需要匹配 branch 和 eventType
	pipelines, err := dao.GetPipelinesByRepositoryOnly(repository)
	if err != nil {
		return "", fmt.Errorf("获取流水线失败: %w", err)
	}

	// 查找启用了webhook的流水线
	for _, pipeline := range pipelines {
		if pipeline.Config.Webhook != nil && pipeline.Config.Webhook.Enabled && pipeline.Config.Webhook.Secret != "" {
			return pipeline.Config.Webhook.Secret, nil
		}
	}

	// 没有找到启用了webhook的流水线
	return "", nil
}

// verifySignature 验证GitHub Webhook签名
func verifySignature(payload []byte, signature, secret string) bool {
	if secret == "" {
		return true // 如果没有配置密钥，跳过验证
	}

	// 统一移除 "sha256=" 前缀
	signature = strings.TrimPrefix(signature, "sha256=")

	// 计算HMAC
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(payload)
	expectedMAC := hex.EncodeToString(mac.Sum(nil))

	// 使用hmac.Equal进行安全的比较
	return hmac.Equal([]byte(signature), []byte(expectedMAC))
}

// WebhookTest 测试Webhook端点
func WebhookTest(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "Webhook端点正常",
		"data": gin.H{
			"timestamp": "2024-01-01T00:00:00Z",
			"endpoint":  "/api/v1/pipeline/webhook",
		},
	})
}
