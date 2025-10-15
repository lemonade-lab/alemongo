package logic

import (
	"alemongo/src/dao"
	"alemongo/src/logger"
	"alemongo/src/models"
	"alemongo/src/settings"
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"
	"time"

	"go.uber.org/zap/zapcore"
)

// CreatePipeline 创建流水线
func CreatePipeline(req *models.PipelineCreateRequest, createdBy string) (*models.Pipeline, error) {
	// 验证流水线配置
	if err := validatePipelineConfig(&req.Config); err != nil {
		return nil, fmt.Errorf("流水线配置无效: %w", err)
	}

	pipeline := &models.Pipeline{
		Name:        req.Name,
		Description: req.Description,
		Repository:  req.Repository,
		Branch:      req.Branch,
		EventType:   req.EventType,
		IsActive:    true,
		Config:      req.Config,
		CreatedBy:   createdBy,
	}

	if err := dao.CreatePipeline(pipeline); err != nil {
		return nil, fmt.Errorf("创建流水线失败: %w", err)
	}

	return pipeline, nil
}

// GetPipeline 获取流水线
func GetPipeline(id uint) (*models.Pipeline, error) {
	return dao.GetPipeline(id)
}

// GetPipelines 获取流水线列表
func GetPipelines(limit, offset int) ([]models.Pipeline, error) {
	return dao.GetPipelines(limit, offset)
}

// UpdatePipeline 更新流水线
func UpdatePipeline(id uint, req *models.PipelineUpdateRequest) error {
	// 如果更新了配置，需要验证
	if req.Config != nil {
		if err := validatePipelineConfig(req.Config); err != nil {
			return fmt.Errorf("流水线配置无效: %w", err)
		}
	}

	return dao.UpdatePipeline(id, req)
}

// DeletePipeline 删除流水线
func DeletePipeline(id uint) error {
	return dao.DeletePipeline(id)
}

// validatePipelineConfig 验证流水线配置
func validatePipelineConfig(config *models.PipelineConfig) error {
	if len(config.Steps) == 0 {
		return errors.New("流水线必须包含至少一个步骤")
	}

	for i, step := range config.Steps {
		if step.Name == "" {
			return fmt.Errorf("步骤 %d 的名称不能为空", i+1)
		}
		if step.Type == "" {
			return fmt.Errorf("步骤 %d 的类型不能为空", i+1)
		}

		// 验证 when 字段
		if step.When != "" && step.When != "always" && step.When != "on_success" && step.When != "on_failure" {
			return fmt.Errorf("步骤 %d (%s) 包含无效的执行条件: %s (仅支持 always, on_success, on_failure)", i+1, step.Name, step.When)
		}

		// 验证步骤类型
		switch step.Type {
		case "update_app":
			if err := validateUpdateAppStep(step); err != nil {
				return fmt.Errorf("步骤 %d (%s) 配置无效: %w", i+1, step.Name, err)
			}
		case "restart_bot":
			if err := validateRestartBotStep(step); err != nil {
				return fmt.Errorf("步骤 %d (%s) 配置无效: %w", i+1, step.Name, err)
			}
		case "custom_command":
			if err := validateCustomCommandStep(step); err != nil {
				return fmt.Errorf("步骤 %d (%s) 配置无效: %w", i+1, step.Name, err)
			}
		default:
			return fmt.Errorf("步骤 %d (%s) 包含不支持的步骤类型: %s", i+1, step.Name, step.Type)
		}
	}

	return nil
}

// validateUpdateAppStep 验证更新应用步骤
func validateUpdateAppStep(step models.PipelineStep) error {
	config := step.Config
	if config["bot_name"] == nil {
		return errors.New("缺少 bot_name 参数")
	}
	if config["app_name"] == nil {
		return errors.New("缺少 app_name 参数")
	}
	return nil
}

// validateRestartBotStep 验证重启机器人步骤
func validateRestartBotStep(step models.PipelineStep) error {
	config := step.Config
	if config["bot_name"] == nil {
		return errors.New("缺少 bot_name 参数")
	}
	return nil
}

// validateCustomCommandStep 验证自定义命令步骤
func validateCustomCommandStep(step models.PipelineStep) error {
	config := step.Config
	if config["command"] == nil {
		return errors.New("缺少 command 参数")
	}
	return nil
}

// ExecutePipeline 执行流水线
func ExecutePipeline(pipelineID uint, payload *models.WebhookPayload, triggeredBy string) (*models.PipelineExecution, error) {
	// 获取流水线配置
	pipeline, err := dao.GetPipeline(pipelineID)
	if err != nil {
		return nil, fmt.Errorf("获取流水线失败: %w", err)
	}

	// 创建执行记录
	execution := &models.PipelineExecution{
		PipelineID:  pipelineID,
		Status:      "pending",
		TriggeredBy: triggeredBy,
		CommitHash:  payload.HeadCommit.ID,
		CommitMsg:   payload.HeadCommit.Message,
		Branch:      strings.TrimPrefix(payload.Ref, "refs/heads/"),
	}

	if err := dao.CreatePipelineExecution(execution); err != nil {
		return nil, fmt.Errorf("创建执行记录失败: %w", err)
	}

	// 预创建步骤记录（便于前端立即展示进度与占位）
	log.Printf("流水线 %d 共有 %d 个步骤", pipelineID, len(pipeline.Config.Steps))
	if len(pipeline.Config.Steps) > 0 {
		for i, step := range pipeline.Config.Steps {
			stepExec := &models.PipelineStepExecution{
				ExecutionID: execution.ID,
				StepName:    step.Name,
				StepType:    step.Type,
				Status:      "pending",
				Config:      step.Config,
				Order:       i + 1,
			}
			if err := dao.CreatePipelineStepExecution(stepExec); err != nil {
				log.Printf("创建步骤 %d (%s) 失败: %v", i+1, step.Name, err)
			} else {
				log.Printf("成功创建步骤 %d (%s), ID: %d", i+1, step.Name, stepExec.ID)
			}
		}
		// 写入一条初始日志，方便用户看到执行已开始排队
		if err := dao.UpdatePipelineExecution(execution.ID, map[string]interface{}{
			"logs": "流水线已排队，准备执行步骤...",
		}); err != nil {
			log.Printf("更新初始日志失败: %v", err)
		}
	}

	// 立即将状态改为 running，让前端看到"执行中"状态
	now := time.Now()
	_ = dao.UpdatePipelineExecution(execution.ID, map[string]interface{}{
		"status":     "running",
		"started_at": &now,
	})

	// 重新查询完整的执行记录（包括 steps）以便返回给前端
	fullExecution, err := dao.GetPipelineExecution(execution.ID)
	if err != nil {
		log.Printf("警告: 获取完整执行记录失败: %v", err)
		// 即使获取失败，也继续执行，只是前端可能看不到初始状态
	} else {
		execution = fullExecution
		log.Printf("成功获取完整执行记录 %d, 包含 %d 个步骤", execution.ID, len(execution.Steps))
	}

	// 异步执行流水线
	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("流水线执行发生 panic: %v", r)
				// 更新执行记录为失败状态
				finishedAt := time.Now()
				dao.UpdatePipelineExecution(execution.ID, map[string]interface{}{
					"status":      "failed",
					"finished_at": &finishedAt,
					"error_msg":   fmt.Sprintf("流水线执行发生 panic: %v", r),
					"logs":        fmt.Sprintf("流水线执行发生严重错误: %v", r),
				})
			}
		}()

		if err := executePipelineSteps(execution, pipeline, payload); err != nil {
			log.Printf("流水线执行失败: %v", err)
		}
	}()

	return execution, nil
}

// executePipelineSteps 执行流水线步骤
func executePipelineSteps(execution *models.PipelineExecution, pipeline *models.Pipeline, payload *models.WebhookPayload) error {
	// 注意: 状态已在 ExecutePipeline 中更新为 running，此处无需重复更新
	// 这里保留注释是为了说明状态管理的设计

	log.Printf("开始执行流水线步骤, 执行ID: %d, 流水线ID: %d", execution.ID, pipeline.ID)
	log.Printf("流水线配置中的步骤数量: %d", len(pipeline.Config.Steps))
	if len(pipeline.Config.Steps) == 0 {
		log.Printf("警告: 流水线配置中没有步骤!")
	}

	var logs []string
	var hasError bool
	var lastStepFailed bool

	// 执行每个步骤
	for i, step := range pipeline.Config.Steps {
		log.Printf("准备执行步骤 %d/%d: %s (类型: %s)", i+1, len(pipeline.Config.Steps), step.Name, step.Type)
		// 根据 when 条件判断是否应该执行此步骤
		shouldExecute := true
		switch step.When {
		case "always":
			shouldExecute = true
		case "on_success":
			shouldExecute = !lastStepFailed
		case "on_failure":
			shouldExecute = lastStepFailed
		default:
			shouldExecute = true // 默认总是执行
		}

		// 尝试复用预创建的步骤记录
		stepExecution, _ := dao.GetPipelineStepExecutionByOrder(execution.ID, i+1)
		if stepExecution == nil {
			stepExecution = &models.PipelineStepExecution{
				ExecutionID: execution.ID,
				StepName:    step.Name,
				StepType:    step.Type,
				Status:      "pending",
				Config:      step.Config,
				Order:       i + 1,
			}
			if err := dao.CreatePipelineStepExecution(stepExecution); err != nil {
				log.Printf("创建步骤执行记录失败: %v", err)
				continue
			}
		}

		// 如果不应该执行,标记为跳过
		if !shouldExecute {
			stepExecution.Status = "skipped"
			logs = append(logs, fmt.Sprintf("=== 步骤 %d: %s ===", i+1, step.Name))
			logs = append(logs, fmt.Sprintf("跳过步骤 (条件: %s)", step.When))

			dao.UpdatePipelineStepExecution(stepExecution.ID, map[string]interface{}{
				"status": "skipped",
				"logs":   fmt.Sprintf("跳过步骤 (条件: %s)", step.When),
			})
			continue
		}

		// 执行步骤
		stepLogs, err := executeStep(stepExecution, pipeline, payload)
		if len(stepLogs) == 0 {
			stepLogs = append(stepLogs, "(无输出)")
		}
		stepExecution.Logs = strings.Join(stepLogs, "\n")
		logs = append(logs, fmt.Sprintf("=== 步骤 %d: %s ===", i+1, step.Name))
		logs = append(logs, stepLogs...)

		if err != nil {
			stepExecution.Status = "failed"
			stepExecution.ErrorMsg = err.Error()
			hasError = true
			lastStepFailed = true
			logs = append(logs, fmt.Sprintf("步骤执行失败: %v", err))
			stepLogs = append(stepLogs, fmt.Sprintf("步骤执行失败: %v", err))
		} else {
			stepExecution.Status = "success"
			lastStepFailed = false
			logs = append(logs, "步骤执行成功")
			stepLogs = append(stepLogs, "步骤执行成功")
		}

		// 将执行日志赋值给 stepExecution (关键修复: 之前忘记赋值了)
		stepExecution.Logs = strings.Join(stepLogs, "\n")

		// 更新步骤执行记录
		finishedAt := time.Now()
		dao.UpdatePipelineStepExecution(stepExecution.ID, map[string]interface{}{
			"status":      stepExecution.Status,
			"logs":        stepExecution.Logs,
			"error_msg":   stepExecution.ErrorMsg,
			"finished_at": &finishedAt,
		})
	}

	// 更新执行记录
	finishedAt := time.Now()
	status := "success"
	if hasError {
		status = "failed"
	}

	dao.UpdatePipelineExecution(execution.ID, map[string]interface{}{
		"status":      status,
		"finished_at": &finishedAt,
		"logs":        strings.Join(logs, "\n"),
	})

	return nil
}

// executeStep 执行单个步骤
func executeStep(stepExecution *models.PipelineStepExecution, pipeline *models.Pipeline, payload *models.WebhookPayload) ([]string, error) {
	var logs []string
	startedAt := time.Now()

	// 更新步骤状态为运行中
	dao.UpdatePipelineStepExecution(stepExecution.ID, map[string]interface{}{
		"status":     "running",
		"started_at": &startedAt,
	})

	// 立刻写入占位日志，便于前端不再显示“无日志”
	_ = dao.UpdatePipelineStepExecution(stepExecution.ID, map[string]interface{}{
		"logs": fmt.Sprintf("开始执行步骤: %s", stepExecution.StepName),
	})

	switch stepExecution.StepType {
	case "update_app":
		return executeUpdateAppStep(stepExecution, pipeline, payload)
	case "restart_bot":
		return executeRestartBotStep(stepExecution, pipeline, payload)
	case "custom_command":
		return executeCustomCommandStep(stepExecution, pipeline, payload)
	default:
		return logs, fmt.Errorf("不支持的步骤类型: %s", stepExecution.StepType)
	}
}

// executeUpdateAppStep 执行更新应用步骤
func executeUpdateAppStep(stepExecution *models.PipelineStepExecution, pipeline *models.Pipeline, payload *models.WebhookPayload) ([]string, error) {
	var logs []string

	logs = append(logs, fmt.Sprintf("步骤配置: %+v", stepExecution.Config))

	botName, ok := stepExecution.Config["bot_name"].(string)
	if !ok {
		logs = append(logs, fmt.Sprintf("bot_name 参数类型错误或不存在, 当前值: %v, 类型: %T", stepExecution.Config["bot_name"], stepExecution.Config["bot_name"]))
		return logs, errors.New("bot_name 参数无效")
	}

	appName, ok := stepExecution.Config["app_name"].(string)
	if !ok {
		logs = append(logs, fmt.Sprintf("app_name 参数类型错误或不存在, 当前值: %v, 类型: %T", stepExecution.Config["app_name"], stepExecution.Config["app_name"]))
		return logs, errors.New("app_name 参数无效")
	}

	logs = append(logs, fmt.Sprintf("开始更新机器人 %s 的应用 %s", botName, appName))

	// 获取机器人日志记录器
	var l = new(zapcore.Level)
	if err := l.UnmarshalText([]byte(settings.Conf.Log.Level)); err != nil {
		return logs, fmt.Errorf("无法解析日志级别: %w", err)
	}

	botLogger, err := logger.GetOrCreateBotLogger(botName, *l)
	if err != nil {
		return logs, fmt.Errorf("获取机器人日志记录器失败: %w", err)
	}
	botLoggerWriter := logger.NewRobotLoggerWriter(botLogger)

	// 解析事件分支：优先使用 webhook 事件中的分支；其次使用执行记录中的分支；最后回退到流水线配置分支
	eventBranch := ""
	if payload != nil {
		// PR 事件
		if payload.PullRequest.Head.Ref != "" {
			eventBranch = payload.PullRequest.Head.Ref
		} else if payload.WorkflowRun.HeadBranch != "" { // workflow_run
			eventBranch = payload.WorkflowRun.HeadBranch
		} else if payload.RefType == "branch" && payload.Ref != "" { // create/delete
			eventBranch = payload.Ref
		} else if payload.Ref != "" { // push 等
			eventBranch = strings.TrimPrefix(payload.Ref, "refs/heads/")
		}
	}
	if eventBranch == "" {
		if exec, err := dao.GetPipelineExecution(stepExecution.ExecutionID); err == nil && exec.Branch != "" {
			eventBranch = exec.Branch
		}
	}
	if eventBranch == "" {
		eventBranch = pipeline.Branch
	}

	logs = append(logs, fmt.Sprintf("切换到分支: %s 并拉取最新代码", eventBranch))

	// 获取 auto_fetch 配置，默认为 true
	autoFetch := true
	if autoFetchVal, ok := stepExecution.Config["auto_fetch"].(bool); ok {
		autoFetch = autoFetchVal
	}
	logs = append(logs, fmt.Sprintf("自动获取远程分支: %v", autoFetch))

	// 执行应用更新（checkout 到事件分支并 pull）
	err = PackegForcedUpdate(botName, appName, eventBranch, botLoggerWriter, autoFetch)
	if err != nil {
		logs = append(logs, fmt.Sprintf("应用更新失败: %v", err))
		return logs, err
	}

	logs = append(logs, "应用更新成功")
	return logs, nil
}

// executeRestartBotStep 执行重启机器人步骤
func executeRestartBotStep(stepExecution *models.PipelineStepExecution, pipeline *models.Pipeline, payload *models.WebhookPayload) ([]string, error) {
	var logs []string

	logs = append(logs, fmt.Sprintf("步骤配置: %+v", stepExecution.Config))

	botName, ok := stepExecution.Config["bot_name"].(string)
	if !ok {
		logs = append(logs, fmt.Sprintf("bot_name 参数类型错误或不存在, 当前值: %v, 类型: %T", stepExecution.Config["bot_name"], stepExecution.Config["bot_name"]))
		return logs, errors.New("bot_name 参数无效")
	}

	// 获取操作类型: restart(重启), stop(停止), start(启动), 默认为 restart
	action, _ := stepExecution.Config["action"].(string)
	if action == "" {
		action = "restart"
	}

	// 获取 auto_start 参数: 停止后是否自动启动, 默认为 false
	autoStart := false
	if autoStartVal, ok := stepExecution.Config["auto_start"].(bool); ok {
		autoStart = autoStartVal
	}

	logs = append(logs, fmt.Sprintf("执行操作: %s (机器人: %s)", action, botName))

	var msg string
	var err error

	switch action {
	case "start":
		// 启动机器人
		if IsRunning(botName) {
			logs = append(logs, "机器人已经在运行")
			return logs, nil
		}
		msg, err = Run(botName)
		if err != nil {
			logs = append(logs, fmt.Sprintf("启动失败: %s", msg))
			return logs, err
		}
		logs = append(logs, "机器人启动成功")

	case "stop":
		// 停止机器人
		if !IsRunning(botName) {
			logs = append(logs, "机器人未在运行")
			return logs, nil
		}
		msg, err = Stop(botName)
		if err != nil {
			logs = append(logs, fmt.Sprintf("停止失败: %s", msg))
			return logs, err
		}
		logs = append(logs, "机器人停止成功")

		// 如果设置了 auto_start, 等待 2 秒后自动启动
		if autoStart {
			logs = append(logs, "等待 2 秒后自动启动...")
			time.Sleep(2 * time.Second)
			msg, err = Run(botName)
			if err != nil {
				logs = append(logs, fmt.Sprintf("自动启动失败: %s", msg))
				return logs, err
			}
			logs = append(logs, "机器人自动启动成功")
		}

	case "restart":
		// 重启机器人
		isRunning := IsRunning(botName)
		logs = append(logs, fmt.Sprintf("当前状态: %v", map[bool]string{true: "运行中", false: "未运行"}[isRunning]))

		if isRunning {
			// 如果正在运行, 使用 Restart 函数
			msg, err = Restart(botName)
			if err != nil {
				logs = append(logs, fmt.Sprintf("重启失败: %s", msg))
				return logs, err
			}
			logs = append(logs, "机器人重启成功")
		} else {
			// 如果未运行, 直接启动
			logs = append(logs, "机器人未运行, 将直接启动")
			msg, err = Run(botName)
			if err != nil {
				logs = append(logs, fmt.Sprintf("启动失败: %s", msg))
				return logs, err
			}
			logs = append(logs, "机器人启动成功")
		}

	default:
		logs = append(logs, fmt.Sprintf("不支持的操作: %s", action))
		return logs, fmt.Errorf("不支持的操作: %s (支持: start, stop, restart)", action)
	}

	return logs, nil
}

// executeCustomCommandStep 执行自定义命令步骤
func executeCustomCommandStep(stepExecution *models.PipelineStepExecution, pipeline *models.Pipeline, payload *models.WebhookPayload) ([]string, error) {
	var logs []string

	logs = append(logs, fmt.Sprintf("步骤配置: %+v", stepExecution.Config))

	command, ok := stepExecution.Config["command"].(string)
	if !ok {
		logs = append(logs, fmt.Sprintf("command 参数类型错误或不存在, 当前值: %v, 类型: %T", stepExecution.Config["command"], stepExecution.Config["command"]))
		return logs, errors.New("command 参数无效")
	}

	workingDir, _ := stepExecution.Config["working_dir"].(string)
	if workingDir == "" {
		workingDir = "/tmp"
	}

	logs = append(logs, fmt.Sprintf("执行自定义命令: %s", command))
	logs = append(logs, fmt.Sprintf("工作目录: %s", workingDir))

	// 执行命令
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	cmd := exec.CommandContext(ctx, "sh", "-c", command)
	cmd.Dir = workingDir

	// 设置环境变量 (继承父进程环境变量)
	cmd.Env = append(os.Environ(),
		fmt.Sprintf("PIPELINE_REPO=%s", pipeline.Repository),
		fmt.Sprintf("PIPELINE_BRANCH=%s", pipeline.Branch),
		fmt.Sprintf("PIPELINE_COMMIT=%s", payload.HeadCommit.ID),
		fmt.Sprintf("PIPELINE_COMMIT_MSG=%s", payload.HeadCommit.Message),
	)

	output, err := cmd.CombinedOutput()
	logs = append(logs, string(output))

	if err != nil {
		logs = append(logs, fmt.Sprintf("命令执行失败: %v", err))
		return logs, err
	}

	logs = append(logs, "命令执行成功")
	return logs, nil
}

// GetPipelineExecution 获取流水线执行记录
func GetPipelineExecution(id uint) (*models.PipelineExecution, error) {
	return dao.GetPipelineExecution(id)
}

// GetPipelineExecutions 获取流水线执行记录列表
func GetPipelineExecutions(pipelineID uint, limit, offset int) ([]models.PipelineExecution, error) {
	return dao.GetPipelineExecutions(pipelineID, limit, offset)
}

// TriggerPipelineByWebhook 通过Webhook触发流水线
func TriggerPipelineByWebhook(payload *models.WebhookPayload, eventType string) error {
	// 解析仓库信息
	repository := payload.Repository.FullName

	// 获取默认分支（优先使用 payload 中的值，其次使用 "main"）
	defaultBranch := payload.Repository.DefaultBranch
	if defaultBranch == "" {
		defaultBranch = "main" // 回退到 main
	}

	// 根据事件类型提取分支信息
	var branch string
	var triggeredBy string

	switch eventType {
	case "push":
		branch = strings.TrimPrefix(payload.Ref, "refs/heads/")
		triggeredBy = payload.Pusher.Name
		if triggeredBy == "" {
			triggeredBy = payload.HeadCommit.Author.Name
		}

	case "pull_request", "pull_request_review":
		branch = payload.PullRequest.Head.Ref
		triggeredBy = payload.PullRequest.User.Login

	case "issues", "issue_comment":
		// Issues事件通常不涉及特定分支，使用默认分支
		branch = defaultBranch
		triggeredBy = payload.Sender.Login
		if triggeredBy == "" && eventType == "issues" {
			triggeredBy = payload.Issue.User.Login
		} else if triggeredBy == "" && eventType == "issue_comment" {
			triggeredBy = payload.Comment.User.Login
		}

	case "release":
		// Release事件通常基于标签，但我们可以使用默认分支
		branch = defaultBranch
		triggeredBy = payload.Release.Author.Login

	case "create", "delete":
		// Create/Delete事件
		if payload.RefType == "branch" {
			branch = payload.Ref
		} else {
			// 标签创建/删除，使用默认分支
			branch = defaultBranch
		}
		triggeredBy = payload.Sender.Login

	case "workflow_run":
		branch = payload.WorkflowRun.HeadBranch
		triggeredBy = payload.Sender.Login

	case "schedule":
		// 定时任务，使用默认分支
		branch = defaultBranch
		triggeredBy = "system"

	default:
		// 默认处理
		branch = strings.TrimPrefix(payload.Ref, "refs/heads/")
		if branch == "" {
			branch = defaultBranch
		}
		triggeredBy = payload.Sender.Login
		if triggeredBy == "" {
			triggeredBy = "unknown"
		}
	}

	// 查找匹配的流水线
	pipelines, err := dao.GetPipelinesByRepository(repository, branch, eventType)
	if err != nil {
		return fmt.Errorf("查找流水线失败: %w", err)
	}

	if len(pipelines) == 0 {
		log.Printf("没有找到匹配的流水线: repository=%s, branch=%s, event_type=%s", repository, branch, eventType)
		return nil
	}

	// 触发所有匹配的流水线
	for _, pipeline := range pipelines {
		_, err := ExecutePipeline(pipeline.ID, payload, triggeredBy)
		if err != nil {
			log.Printf("触发流水线失败: pipeline_id=%d, error=%v", pipeline.ID, err)
		} else {
			log.Printf("成功触发流水线: pipeline_id=%d, name=%s", pipeline.ID, pipeline.Name)
		}
	}

	return nil
}
