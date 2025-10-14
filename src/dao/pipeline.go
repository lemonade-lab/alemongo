package dao

import (
	"alemongo/src/dao/db"
	"alemongo/src/models"
	"encoding/json"
	"errors"
	"time"

	"github.com/IGLOU-EU/go-wildcard"
	"gorm.io/gorm"
)

// CreatePipeline 创建流水线
func CreatePipeline(pipeline *models.Pipeline) error {
	if db.Get() == nil {
		return errors.New("数据库未初始化")
	}

	configJSON, err := json.Marshal(pipeline.Config)
	if err != nil {
		return err
	}

	pipelineDO := &db.PipelineDO{
		Name:        pipeline.Name,
		Description: pipeline.Description,
		Repository:  pipeline.Repository,
		Branch:      pipeline.Branch,
		EventType:   pipeline.EventType,
		IsActive:    pipeline.IsActive,
		Config:      string(configJSON),
		CreatedBy:   pipeline.CreatedBy,
	}

	if err := db.Get().Create(pipelineDO).Error; err != nil {
		return err
	}

	pipeline.ID = pipelineDO.ID
	pipeline.CreatedAt = pipelineDO.CreatedAt
	pipeline.UpdatedAt = pipelineDO.UpdatedAt
	return nil
}

// GetPipeline 获取流水线
func GetPipeline(id uint) (*models.Pipeline, error) {
	if db.Get() == nil {
		return nil, errors.New("数据库未初始化")
	}

	var pipelineDO db.PipelineDO
	if err := db.Get().First(&pipelineDO, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("流水线不存在")
		}
		return nil, err
	}

	pipeline := &models.Pipeline{
		ID:          pipelineDO.ID,
		Name:        pipelineDO.Name,
		Description: pipelineDO.Description,
		Repository:  pipelineDO.Repository,
		Branch:      pipelineDO.Branch,
		EventType:   pipelineDO.EventType,
		IsActive:    pipelineDO.IsActive,
		CreatedBy:   pipelineDO.CreatedBy,
		CreatedAt:   pipelineDO.CreatedAt,
		UpdatedAt:   pipelineDO.UpdatedAt,
	}

	if err := json.Unmarshal([]byte(pipelineDO.Config), &pipeline.Config); err != nil {
		return nil, err
	}

	return pipeline, nil
}

// GetPipelines 获取流水线列表
func GetPipelines(limit, offset int) ([]models.Pipeline, error) {
	if db.Get() == nil {
		return nil, errors.New("数据库未初始化")
	}

	var pipelineDOs []db.PipelineDO
	if err := db.Get().Limit(limit).Offset(offset).Order("created_at DESC").Find(&pipelineDOs).Error; err != nil {
		return nil, err
	}

	pipelines := make([]models.Pipeline, len(pipelineDOs))
	for i, pipelineDO := range pipelineDOs {
		pipeline := models.Pipeline{
			ID:          pipelineDO.ID,
			Name:        pipelineDO.Name,
			Description: pipelineDO.Description,
			Repository:  pipelineDO.Repository,
			Branch:      pipelineDO.Branch,
			EventType:   pipelineDO.EventType,
			IsActive:    pipelineDO.IsActive,
			CreatedBy:   pipelineDO.CreatedBy,
			CreatedAt:   pipelineDO.CreatedAt,
			UpdatedAt:   pipelineDO.UpdatedAt,
		}

		if err := json.Unmarshal([]byte(pipelineDO.Config), &pipeline.Config); err != nil {
			return nil, err
		}

		pipelines[i] = pipeline
	}

	return pipelines, nil
}

// UpdatePipeline 更新流水线
func UpdatePipeline(id uint, updates *models.PipelineUpdateRequest) error {
	if db.Get() == nil {
		return errors.New("数据库未初始化")
	}

	updateData := make(map[string]interface{})
	if updates.Name != "" {
		updateData["name"] = updates.Name
	}
	if updates.Description != "" {
		updateData["description"] = updates.Description
	}
	if updates.Repository != "" {
		updateData["repository"] = updates.Repository
	}
	if updates.Branch != "" {
		updateData["branch"] = updates.Branch
	}
	if updates.EventType != "" {
		updateData["event_type"] = updates.EventType
	}
	if updates.IsActive != nil {
		updateData["is_active"] = *updates.IsActive
	}
	if updates.Config != nil {
		configJSON, err := json.Marshal(updates.Config)
		if err != nil {
			return err
		}
		updateData["config"] = string(configJSON)
	}

	updateData["updated_at"] = time.Now()

	return db.Get().Model(&db.PipelineDO{}).Where("id = ?", id).Updates(updateData).Error
}

// DeletePipeline 删除流水线
func DeletePipeline(id uint) error {
	if db.Get() == nil {
		return errors.New("数据库未初始化")
	}

	return db.Get().Delete(&db.PipelineDO{}, id).Error
}

// matchBranch 检查分支是否匹配，支持通配符
// pattern: 流水线配置的分支模式（支持 * 和 ? 通配符）
// branch: 实际的分支名
func matchBranch(pattern, branch string) bool {
	// 精确匹配
	if pattern == branch {
		return true
	}

	// 使用go-wildcard库进行通配符匹配
	// 支持 * (匹配任意字符) 和 ? (匹配单个字符)
	return wildcard.Match(pattern, branch)
}

// GetPipelinesByRepository 根据仓库获取流水线
func GetPipelinesByRepository(repository, branch, eventType string) ([]models.Pipeline, error) {
	if db.Get() == nil {
		return nil, errors.New("数据库未初始化")
	}

	var pipelineDOs []db.PipelineDO

	// 先获取所有匹配仓库和事件类型的流水线
	query := db.Get().Where("repository = ? AND event_type = ? AND is_active = ?",
		repository, eventType, true)

	if err := query.Find(&pipelineDOs).Error; err != nil {
		return nil, err
	}

	// 在内存中进行分支匹配，支持通配符
	var matchedPipelines []db.PipelineDO
	for _, pipeline := range pipelineDOs {
		if matchBranch(pipeline.Branch, branch) {
			matchedPipelines = append(matchedPipelines, pipeline)
		}
	}

	pipelineDOs = matchedPipelines

	pipelines := make([]models.Pipeline, len(pipelineDOs))
	for i, pipelineDO := range pipelineDOs {
		pipeline := models.Pipeline{
			ID:          pipelineDO.ID,
			Name:        pipelineDO.Name,
			Description: pipelineDO.Description,
			Repository:  pipelineDO.Repository,
			Branch:      pipelineDO.Branch,
			EventType:   pipelineDO.EventType,
			IsActive:    pipelineDO.IsActive,
			CreatedBy:   pipelineDO.CreatedBy,
			CreatedAt:   pipelineDO.CreatedAt,
			UpdatedAt:   pipelineDO.UpdatedAt,
		}

		if err := json.Unmarshal([]byte(pipelineDO.Config), &pipeline.Config); err != nil {
			return nil, err
		}

		pipelines[i] = pipeline
	}

	return pipelines, nil
}

// GetPipelinesByRepositoryOnly 仅根据仓库名获取所有激活的流水线(用于 webhook 密钥查询)
func GetPipelinesByRepositoryOnly(repository string) ([]models.Pipeline, error) {
	if db.Get() == nil {
		return nil, errors.New("数据库未初始化")
	}

	var pipelineDOs []db.PipelineDO
	// 只根据仓库名和激活状态查询,不限制 branch 和 eventType
	if err := db.Get().Where("repository = ? AND is_active = ?", repository, true).Find(&pipelineDOs).Error; err != nil {
		return nil, err
	}

	pipelines := make([]models.Pipeline, len(pipelineDOs))
	for i, pipelineDO := range pipelineDOs {
		pipeline := models.Pipeline{
			ID:          pipelineDO.ID,
			Name:        pipelineDO.Name,
			Description: pipelineDO.Description,
			Repository:  pipelineDO.Repository,
			Branch:      pipelineDO.Branch,
			EventType:   pipelineDO.EventType,
			IsActive:    pipelineDO.IsActive,
			CreatedBy:   pipelineDO.CreatedBy,
			CreatedAt:   pipelineDO.CreatedAt,
			UpdatedAt:   pipelineDO.UpdatedAt,
		}

		if err := json.Unmarshal([]byte(pipelineDO.Config), &pipeline.Config); err != nil {
			return nil, err
		}

		pipelines[i] = pipeline
	}

	return pipelines, nil
}

// CreatePipelineExecution 创建流水线执行记录
func CreatePipelineExecution(execution *models.PipelineExecution) error {
	if db.Get() == nil {
		return errors.New("数据库未初始化")
	}

	executionDO := &db.PipelineExecutionDO{
		PipelineID:  execution.PipelineID,
		Status:      execution.Status,
		TriggeredBy: execution.TriggeredBy,
		CommitHash:  execution.CommitHash,
		CommitMsg:   execution.CommitMsg,
		Branch:      execution.Branch,
		StartedAt:   execution.StartedAt,
		FinishedAt:  execution.FinishedAt,
		Logs:        execution.Logs,
		ErrorMsg:    execution.ErrorMsg,
	}

	if err := db.Get().Create(executionDO).Error; err != nil {
		return err
	}

	execution.ID = executionDO.ID
	execution.CreatedAt = executionDO.CreatedAt
	execution.UpdatedAt = executionDO.UpdatedAt
	return nil
}

// UpdatePipelineExecution 更新流水线执行记录
func UpdatePipelineExecution(id uint, updates map[string]interface{}) error {
	if db.Get() == nil {
		return errors.New("数据库未初始化")
	}

	updates["updated_at"] = time.Now()
	return db.Get().Model(&db.PipelineExecutionDO{}).Where("id = ?", id).Updates(updates).Error
}

// GetPipelineExecution 获取流水线执行记录
func GetPipelineExecution(id uint) (*models.PipelineExecution, error) {
	if db.Get() == nil {
		return nil, errors.New("数据库未初始化")
	}

	var executionDO db.PipelineExecutionDO
	if err := db.Get().First(&executionDO, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("执行记录不存在")
		}
		return nil, err
	}

	execution := &models.PipelineExecution{
		ID:          executionDO.ID,
		PipelineID:  executionDO.PipelineID,
		Status:      executionDO.Status,
		TriggeredBy: executionDO.TriggeredBy,
		CommitHash:  executionDO.CommitHash,
		CommitMsg:   executionDO.CommitMsg,
		Branch:      executionDO.Branch,
		StartedAt:   executionDO.StartedAt,
		FinishedAt:  executionDO.FinishedAt,
		Logs:        executionDO.Logs,
		ErrorMsg:    executionDO.ErrorMsg,
		CreatedAt:   executionDO.CreatedAt,
		UpdatedAt:   executionDO.UpdatedAt,
	}

	// 获取步骤执行记录
	steps, err := GetPipelineStepExecutions(id)
	if err != nil {
		return nil, err
	}
	execution.Steps = steps

	return execution, nil
}

// GetPipelineExecutions 获取流水线执行记录列表
func GetPipelineExecutions(pipelineID uint, limit, offset int) ([]models.PipelineExecution, error) {
	if db.Get() == nil {
		return nil, errors.New("数据库未初始化")
	}

	var executionDOs []db.PipelineExecutionDO
	query := db.Get().Where("pipeline_id = ?", pipelineID)
	if err := query.Limit(limit).Offset(offset).Order("created_at DESC").Find(&executionDOs).Error; err != nil {
		return nil, err
	}

	executions := make([]models.PipelineExecution, len(executionDOs))
	for i, executionDO := range executionDOs {
		execution := models.PipelineExecution{
			ID:          executionDO.ID,
			PipelineID:  executionDO.PipelineID,
			Status:      executionDO.Status,
			TriggeredBy: executionDO.TriggeredBy,
			CommitHash:  executionDO.CommitHash,
			CommitMsg:   executionDO.CommitMsg,
			Branch:      executionDO.Branch,
			StartedAt:   executionDO.StartedAt,
			FinishedAt:  executionDO.FinishedAt,
			Logs:        executionDO.Logs,
			ErrorMsg:    executionDO.ErrorMsg,
			CreatedAt:   executionDO.CreatedAt,
			UpdatedAt:   executionDO.UpdatedAt,
		}

		executions[i] = execution
	}

	return executions, nil
}

// CreatePipelineStepExecution 创建流水线步骤执行记录
func CreatePipelineStepExecution(step *models.PipelineStepExecution) error {
	if db.Get() == nil {
		return errors.New("数据库未初始化")
	}

	configJSON, err := json.Marshal(step.Config)
	if err != nil {
		return err
	}

	stepDO := &db.PipelineStepDO{
		ExecutionID: step.ExecutionID,
		StepName:    step.StepName,
		StepType:    step.StepType,
		Status:      step.Status,
		Config:      string(configJSON),
		StartedAt:   step.StartedAt,
		FinishedAt:  step.FinishedAt,
		Logs:        step.Logs,
		ErrorMsg:    step.ErrorMsg,
		Order:       step.Order,
	}

	if err := db.Get().Create(stepDO).Error; err != nil {
		return err
	}

	step.ID = stepDO.ID
	step.CreatedAt = stepDO.CreatedAt
	step.UpdatedAt = stepDO.UpdatedAt
	return nil
}

// UpdatePipelineStepExecution 更新流水线步骤执行记录
func UpdatePipelineStepExecution(id uint, updates map[string]interface{}) error {
	if db.Get() == nil {
		return errors.New("数据库未初始化")
	}

	updates["updated_at"] = time.Now()
	return db.Get().Model(&db.PipelineStepDO{}).Where("id = ?", id).Updates(updates).Error
}

// GetPipelineStepExecutions 获取流水线步骤执行记录
func GetPipelineStepExecutions(executionID uint) ([]models.PipelineStepExecution, error) {
	if db.Get() == nil {
		return nil, errors.New("数据库未初始化")
	}

	var stepDOs []db.PipelineStepDO
	if err := db.Get().Where("execution_id = ?", executionID).Order("step_order ASC").Find(&stepDOs).Error; err != nil {
		return nil, err
	}

	steps := make([]models.PipelineStepExecution, len(stepDOs))
	for i, stepDO := range stepDOs {
		step := models.PipelineStepExecution{
			ID:          stepDO.ID,
			ExecutionID: stepDO.ExecutionID,
			StepName:    stepDO.StepName,
			StepType:    stepDO.StepType,
			Status:      stepDO.Status,
			StartedAt:   stepDO.StartedAt,
			FinishedAt:  stepDO.FinishedAt,
			Logs:        stepDO.Logs,
			ErrorMsg:    stepDO.ErrorMsg,
			Order:       stepDO.Order,
			CreatedAt:   stepDO.CreatedAt,
			UpdatedAt:   stepDO.UpdatedAt,
		}

		if err := json.Unmarshal([]byte(stepDO.Config), &step.Config); err != nil {
			return nil, err
		}

		steps[i] = step
	}

	return steps, nil
}

// GetPipelineStepExecutionByOrder 根据执行ID与顺序获取单个步骤执行记录（若不存在返回nil, nil）
func GetPipelineStepExecutionByOrder(executionID uint, order int) (*models.PipelineStepExecution, error) {
	if db.Get() == nil {
		return nil, errors.New("数据库未初始化")
	}

	var stepDO db.PipelineStepDO
	if err := db.Get().Where("execution_id = ? AND step_order = ?", executionID, order).First(&stepDO).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	step := &models.PipelineStepExecution{
		ID:          stepDO.ID,
		ExecutionID: stepDO.ExecutionID,
		StepName:    stepDO.StepName,
		StepType:    stepDO.StepType,
		Status:      stepDO.Status,
		StartedAt:   stepDO.StartedAt,
		FinishedAt:  stepDO.FinishedAt,
		Logs:        stepDO.Logs,
		ErrorMsg:    stepDO.ErrorMsg,
		Order:       stepDO.Order,
		CreatedAt:   stepDO.CreatedAt,
		UpdatedAt:   stepDO.UpdatedAt,
	}

	if err := json.Unmarshal([]byte(stepDO.Config), &step.Config); err != nil {
		return nil, err
	}

	return step, nil
}
