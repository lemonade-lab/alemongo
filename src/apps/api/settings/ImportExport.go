package settings

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"alemongo/src/models"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// ExportSettings 导出配置
// @Summary 导出系统配置
// @Description 导出指定类别或全部配置为 JSON 格式
// @Tags 设置
// @Accept json
// @Produce json
// @Param category query string false "配置类别（不传则导出全部）"
// @Success 200 {array} models.Setting "配置列表"
// @Failure 500 {object} response.ResponseData "导出失败"
// @Router /api/v1/settings/export [get]
func ExportSettings(ctx *gin.Context) {
	category := ctx.Query("category")

	settings, err := dao.ExportSettings(category)
	if err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.ErrReadConfigCatFailed)
		return
	}

	// 设置响应头以触发文件下载
	filename := "alemongo_settings_all.json"
	if category != "" {
		filename = "alemongo_settings_" + category + ".json"
	}
	ctx.Header("Content-Disposition", "attachment; filename="+filename)
	ctx.Header("Content-Type", "application/json")

	response.ResponseSuccess(ctx, settings)
}

// ImportSettingsRequest 导入配置请求
type ImportSettingsRequest struct {
	Settings  []models.Setting `json:"settings" binding:"required"`
	Overwrite bool             `json:"overwrite"` // 是否覆盖已存在的配置
}

// ImportSettings 导入配置
// @Summary 导入系统配置
// @Description 批量导入配置，支持覆盖或跳过已存在的配置
// @Tags 设置
// @Accept json
// @Produce json
// @Param body body ImportSettingsRequest true "配置列表和导入选项"
// @Success 200 {object} response.ResponseData{data=object} "导入结果"
// @Failure 400 {object} response.ResponseData "请求参数错误"
// @Failure 500 {object} response.ResponseData "导入失败"
// @Router /api/v1/settings/import [post]
func ImportSettings(ctx *gin.Context) {
	var req ImportSettingsRequest

	// 读取请求体
	body, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		response.ResponseError(ctx, http.StatusBadRequest, response.ErrCreateConfigCatFailed)
		return
	}

	// 解析 JSON
	if err := json.Unmarshal(body, &req); err != nil {
		response.ResponseError(ctx, http.StatusBadRequest, response.ErrCreateConfigCatFailed)
		return
	}

	if len(req.Settings) == 0 {
		response.ResponseErrorWithMsg(ctx, http.StatusBadRequest, response.ErrCreateConfigCatFailed, "配置列表不能为空")
		return
	}

	// 执行导入
	imported, skipped, failed, err := dao.ImportSettings(req.Settings, req.Overwrite)
	if err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.CreateConfigFailed)
		return
	}

	// 返回导入结果
	result := map[string]interface{}{
		"imported":  imported,
		"skipped":   skipped,
		"failed":    failed,
		"total":     len(req.Settings),
		"timestamp": time.Now().Unix(),
	}

	response.ResponseSuccess(ctx, result)
}
