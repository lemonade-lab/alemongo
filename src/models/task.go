package models

import "time"

type TaskStatus string

const (
	TaskPending  TaskStatus = "pending"
	TaskRunning  TaskStatus = "running"
	TaskSuccess  TaskStatus = "success"
	TaskError    TaskStatus = "error"
	TaskCanceled TaskStatus = "canceled"
)

type Task struct {
	ID        string     `json:"id"`
	Type      string     `json:"type"` // e.g. install
	Commands  []string   `json:"commands"`
	Status    TaskStatus `json:"status"`
	CreatedAt time.Time  `json:"createdAt"`
	StartedAt *time.Time `json:"startedAt,omitempty"`
	EndedAt   *time.Time `json:"endedAt,omitempty"`
	Logs      []string   `json:"logs"`
	Error     string     `json:"error,omitempty"`
}
