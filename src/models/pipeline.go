package models

import "time"

// Pipeline 流水线配置
type Pipeline struct {
	ID          uint           `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Repository  string         `json:"repository"`
	Branch      string         `json:"branch"`
	EventType   string         `json:"event_type"`
	IsActive    bool           `json:"is_active"`
	Config      PipelineConfig `json:"config"`
	CreatedBy   string         `json:"created_by"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

// PipelineConfig 流水线配置结构
type PipelineConfig struct {
	Steps   []PipelineStep `json:"steps"`
	Webhook *WebhookConfig `json:"webhook,omitempty"` // Webhook 配置
}

// WebhookConfig Webhook 配置
type WebhookConfig struct {
	Enabled bool   `json:"enabled"` // 是否启用 Webhook
	Secret  string `json:"secret"`  // Webhook 密钥
}

// PipelineStep 流水线步骤
type PipelineStep struct {
	Name   string                 `json:"name"`
	Type   string                 `json:"type"` // update_app, restart_bot, custom_command
	Config map[string]interface{} `json:"config"`
	When   string                 `json:"when"` // 执行条件 (always, on_success, on_failure)
}

// PipelineExecution 流水线执行记录
type PipelineExecution struct {
	ID          uint                    `json:"id"`
	PipelineID  uint                    `json:"pipeline_id"`
	Status      string                  `json:"status"` // pending, running, success, failed, cancelled
	TriggeredBy string                  `json:"triggered_by"`
	CommitHash  string                  `json:"commit_hash"`
	CommitMsg   string                  `json:"commit_msg"`
	Branch      string                  `json:"branch"`
	StartedAt   *time.Time              `json:"started_at"`
	FinishedAt  *time.Time              `json:"finished_at"`
	Logs        string                  `json:"logs"`
	ErrorMsg    string                  `json:"error_msg"`
	Steps       []PipelineStepExecution `json:"steps"`
	CreatedAt   time.Time               `json:"created_at"`
	UpdatedAt   time.Time               `json:"updated_at"`
}

// PipelineStepExecution 流水线步骤执行记录
type PipelineStepExecution struct {
	ID          uint                   `json:"id"`
	ExecutionID uint                   `json:"execution_id"`
	StepName    string                 `json:"step_name"`
	StepType    string                 `json:"step_type"`
	Status      string                 `json:"status"` // pending, running, success, failed, skipped
	Config      map[string]interface{} `json:"config"`
	StartedAt   *time.Time             `json:"started_at"`
	FinishedAt  *time.Time             `json:"finished_at"`
	Logs        string                 `json:"logs"`
	ErrorMsg    string                 `json:"error_msg"`
	Order       int                    `json:"order"`
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
}

// WebhookPayload Webhook载荷
type WebhookPayload struct {
	// 通用字段
	Ref        string `json:"ref"`
	Action     string `json:"action"` // 事件动作 (opened, closed, created, etc.)
	Repository struct {
		FullName      string `json:"full_name"`
		CloneURL      string `json:"clone_url"`
		SSHURL        string `json:"ssh_url"`
		DefaultBranch string `json:"default_branch"` // 默认分支
	} `json:"repository"`

	// Push事件字段
	Commits []struct {
		ID      string `json:"id"`
		Message string `json:"message"`
		Author  struct {
			Name  string `json:"name"`
			Email string `json:"email"`
		} `json:"author"`
	} `json:"commits"`
	HeadCommit struct {
		ID      string `json:"id"`
		Message string `json:"message"`
		Author  struct {
			Name  string `json:"name"`
			Email string `json:"email"`
		} `json:"author"`
	} `json:"head_commit"`
	Pusher struct {
		Name  string `json:"name"`
		Email string `json:"email"`
	} `json:"pusher"`

	// Pull Request事件字段
	PullRequest struct {
		Number int    `json:"number"`
		Title  string `json:"title"`
		Body   string `json:"body"`
		State  string `json:"state"`
		Head   struct {
			Ref string `json:"ref"`
			SHA string `json:"sha"`
		} `json:"head"`
		Base struct {
			Ref string `json:"ref"`
			SHA string `json:"sha"`
		} `json:"base"`
		User struct {
			Login string `json:"login"`
		} `json:"user"`
	} `json:"pull_request"`

	// Issue事件字段
	Issue struct {
		Number int    `json:"number"`
		Title  string `json:"title"`
		Body   string `json:"body"`
		State  string `json:"state"`
		User   struct {
			Login string `json:"login"`
		} `json:"user"`
	} `json:"issue"`

	// Comment事件字段
	Comment struct {
		ID   int    `json:"id"`
		Body string `json:"body"`
		User struct {
			Login string `json:"login"`
		} `json:"user"`
	} `json:"comment"`

	// Release事件字段
	Release struct {
		TagName    string `json:"tag_name"`
		Name       string `json:"name"`
		Body       string `json:"body"`
		Draft      bool   `json:"draft"`
		Prerelease bool   `json:"prerelease"`
		Author     struct {
			Login string `json:"login"`
		} `json:"author"`
	} `json:"release"`

	// Create/Delete事件字段
	RefType string `json:"ref_type"` // branch, tag
	// 注意：GitHub 的 create/delete 事件同样使用字段 "ref" 表示分支或标签名，此处直接复用上方的 Ref 字段

	// Workflow Run事件字段
	WorkflowRun struct {
		ID         int    `json:"id"`
		Name       string `json:"name"`
		Status     string `json:"status"`
		Conclusion string `json:"conclusion"`
		HeadBranch string `json:"head_branch"`
		HeadSHA    string `json:"head_sha"`
	} `json:"workflow_run"`

	// 发送者信息
	Sender struct {
		Login string `json:"login"`
		Type  string `json:"type"`
	} `json:"sender"`
}

// PipelineCreateRequest 创建流水线请求
type PipelineCreateRequest struct {
	Name        string         `json:"name" binding:"required"`
	Description string         `json:"description"`
	Repository  string         `json:"repository" binding:"required"`
	Branch      string         `json:"branch" binding:"required"`
	EventType   string         `json:"event_type" binding:"required"`
	Config      PipelineConfig `json:"config" binding:"required"`
}

// PipelineUpdateRequest 更新流水线请求
type PipelineUpdateRequest struct {
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Repository  string          `json:"repository"`
	Branch      string          `json:"branch"`
	EventType   string          `json:"event_type"`
	IsActive    *bool           `json:"is_active"`
	Config      *PipelineConfig `json:"config"`
}

// PipelineResponse 流水线响应
type PipelineResponse struct {
	Code int      `json:"code"`
	Msg  string   `json:"msg"`
	Data Pipeline `json:"data"`
}

// PipelineListResponse 流水线列表响应
type PipelineListResponse struct {
	Code int        `json:"code"`
	Msg  string     `json:"msg"`
	Data []Pipeline `json:"data"`
}

// PipelineExecutionResponse 流水线执行响应
type PipelineExecutionResponse struct {
	Code int               `json:"code"`
	Msg  string            `json:"msg"`
	Data PipelineExecution `json:"data"`
}

// PipelineExecutionListResponse 流水线执行列表响应
type PipelineExecutionListResponse struct {
	Code int                 `json:"code"`
	Msg  string              `json:"msg"`
	Data []PipelineExecution `json:"data"`
}
