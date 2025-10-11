package db

import "time"

// PipelineDO 流水线配置表
type PipelineDO struct {
	ID        uint `gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time

	Name        string `gorm:"size:128;not null"`  // 流水线名称
	Description string `gorm:"type:text"`          // 流水线描述
	Repository  string `gorm:"size:256;not null"`  // 仓库地址
	Branch      string `gorm:"size:128;not null"`  // 分支名称
	EventType   string `gorm:"size:32;not null"`   // 触发事件类型 (push, pull_request, etc.)
	IsActive    bool   `gorm:"default:true"`       // 是否启用
	Config      string `gorm:"type:text;not null"` // 流水线配置JSON
	CreatedBy   string `gorm:"size:128;not null"`  // 创建者
}

func (PipelineDO) TableName() string { return "pipelines" }

// PipelineExecutionDO 流水线执行记录表
type PipelineExecutionDO struct {
	ID        uint `gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time

	PipelineID  uint       `gorm:"not null;index"`         // 流水线ID
	Status      string     `gorm:"size:16;not null;index"` // 执行状态 (pending, running, success, failed, cancelled)
	TriggeredBy string     `gorm:"size:128"`               // 触发者
	CommitHash  string     `gorm:"size:64"`                // 提交哈希
	CommitMsg   string     `gorm:"type:text"`              // 提交消息
	Branch      string     `gorm:"size:128"`               // 分支
	StartedAt   *time.Time // 开始时间
	FinishedAt  *time.Time // 结束时间
	Logs        string     `gorm:"type:text"` // 执行日志
	ErrorMsg    string     `gorm:"type:text"` // 错误信息
}

func (PipelineExecutionDO) TableName() string { return "pipeline_executions" }

// PipelineStepDO 流水线步骤表
type PipelineStepDO struct {
	ID        uint `gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time

	ExecutionID uint       `gorm:"not null;index"`         // 执行记录ID
	StepName    string     `gorm:"size:128;not null"`      // 步骤名称
	StepType    string     `gorm:"size:32;not null"`       // 步骤类型 (update_app, restart_bot, custom_command)
	Status      string     `gorm:"size:16;not null;index"` // 步骤状态 (pending, running, success, failed, skipped)
	Config      string     `gorm:"type:text"`              // 步骤配置JSON
	StartedAt   *time.Time // 开始时间
	FinishedAt  *time.Time // 结束时间
	Logs        string     `gorm:"type:text"`                            // 步骤日志
	ErrorMsg    string     `gorm:"type:text"`                            // 错误信息
	Order       int        `gorm:"column:step_order;not null;default:0"` // 执行顺序
}

func (PipelineStepDO) TableName() string { return "pipeline_steps" }
