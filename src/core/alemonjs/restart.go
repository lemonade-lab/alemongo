package alemonjs

import (
	"alemongo/src/core/process"
	"os"
)

// 重启机器人
func Restart(name string) (string, error) {
	pm := process.GetProcessManager()
	proc := pm.GetProcess(name)
	if proc == nil {
		return "进程未注册", os.ErrNotExist
	}
	err := proc.Restart()
	if err != nil {
		return "重启失败", err
	}
	return "", nil
}
