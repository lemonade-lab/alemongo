package tasks

import (
	"alemongo/src/models"
	"context"
	"errors"
	"fmt"
	"os/exec"
	"sort"
	"strings"
	"sync"
	"time"
)

type Runner struct {
	mu    sync.RWMutex
	tasks map[string]*models.Task
	// 保存每个任务的取消函数，用于外部取消正在执行的命令
	cancels map[string]context.CancelFunc
}

var defaultRunner *Runner
var once sync.Once

func Default() *Runner {
	once.Do(func() {
		defaultRunner = &Runner{tasks: map[string]*models.Task{}, cancels: map[string]context.CancelFunc{}}
	})
	return defaultRunner
}

func (r *Runner) CreateTask(taskType string, commands []string) *models.Task {
	t := &models.Task{
		ID:        fmt.Sprintf("tsk_%d", time.Now().UnixNano()),
		Type:      taskType,
		Commands:  commands,
		Status:    models.TaskPending,
		CreatedAt: time.Now(),
		Logs:      []string{},
	}
	r.mu.Lock()
	r.tasks[t.ID] = t
	r.mu.Unlock()
	go r.execute(t)
	return t
}

func (r *Runner) execute(t *models.Task) {
	r.appendLog(t.ID, "开始执行任务，共 %d 个命令", len(t.Commands))
	now := time.Now()
	r.updateStatus(t.ID, models.TaskRunning)
	r.setStart(t.ID, now)
	ctx, cancel := context.WithCancel(context.Background())
	r.mu.Lock()
	r.cancels[t.ID] = cancel
	r.mu.Unlock()
	defer func() {
		// 执行结束后清理取消函数
		r.mu.Lock()
		delete(r.cancels, t.ID)
		r.mu.Unlock()
		cancel()
	}()
	for i, cmdStr := range t.Commands {
		r.appendLog(t.ID, "[%d/%d] $ %s", i+1, len(t.Commands), cmdStr)
		// 通过 bash -lc 执行以兼容 nvm 等 shell 函数
		cmd := exec.CommandContext(ctx, "bash", "-lc", cmdStr)
		out, err := cmd.CombinedOutput()
		if len(out) > 0 {
			r.appendLog(t.ID, "%s", strings.TrimRight(string(out), "\n"))
		}
		if err != nil {
			// 区分用户取消与命令失败
			if errors.Is(ctx.Err(), context.Canceled) {
				r.appendLog(t.ID, "任务已被取消")
				r.finish(t.ID, models.TaskCanceled)
			} else {
				r.appendLog(t.ID, "命令失败: %v", err)
				r.setError(t.ID, err.Error())
				r.finish(t.ID, models.TaskError)
			}
			return
		}
	}
	r.finish(t.ID, models.TaskSuccess)
}

func (r *Runner) appendLog(id string, format string, args ...any) {
	r.mu.Lock()
	if t := r.tasks[id]; t != nil {
		t.Logs = append(t.Logs, fmt.Sprintf(format, args...))
	}
	r.mu.Unlock()
}

func (r *Runner) updateStatus(id string, s models.TaskStatus) {
	r.mu.Lock()
	if t := r.tasks[id]; t != nil {
		t.Status = s
	}
	r.mu.Unlock()
}

func (r *Runner) setStart(id string, tm time.Time) {
	r.mu.Lock()
	if t := r.tasks[id]; t != nil {
		t.StartedAt = &tm
	}
	r.mu.Unlock()
}

func (r *Runner) setError(id string, e string) {
	r.mu.Lock()
	if t := r.tasks[id]; t != nil {
		t.Error = e
	}
	r.mu.Unlock()
}

func (r *Runner) finish(id string, s models.TaskStatus) {
	now := time.Now()
	r.mu.Lock()
	if t := r.tasks[id]; t != nil {
		t.Status = s
		t.EndedAt = &now
	}
	r.mu.Unlock()
}

func (r *Runner) Get(id string) *models.Task {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.tasks[id]
}

func (r *Runner) List() []*models.Task {
	r.mu.RLock()
	defer r.mu.RUnlock()
	arr := make([]*models.Task, 0, len(r.tasks))
	for _, t := range r.tasks {
		arr = append(arr, t)
	}
	// 按创建时间倒序返回（新任务在前）
	sort.Slice(arr, func(i, j int) bool { return arr[i].CreatedAt.After(arr[j].CreatedAt) })
	return arr
}

// Cancel 取消正在执行的任务，返回是否成功取消
func (r *Runner) Cancel(id string) bool {
	r.mu.RLock()
	cancel, ok := r.cancels[id]
	r.mu.RUnlock()
	if !ok {
		return false
	}
	r.appendLog(id, "收到取消请求，正在停止当前命令…")
	cancel()
	return true
}
