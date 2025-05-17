package alemonjs

import (
	"alemongo/src/core/process"
	"os"
)

// 停止机器人
func Stop(name string) (string, error) {
	pm := process.GetProcessManager()
	proc := pm.GetProcess(name)
	if proc == nil {
		return "进程未注册", os.ErrNotExist
	}
	err := proc.Stop()
	if err != nil {
		return "停止失败", err
	}
	return "", nil
}
