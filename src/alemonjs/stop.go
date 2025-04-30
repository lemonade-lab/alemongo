package alemonjs

import (
	"os"
	"strconv"

	"github.com/shirou/gopsutil/v3/process"
)

// 停止机器人
func Stop(name string) (string, error) {
	pidFile := GetPidFilePath(name)

	// 读取 PID 文件
	pidData, err := os.ReadFile(pidFile)
	if os.IsNotExist(err) {
		return "PID 文件不存在", nil
	} else if err != nil {
		return "读取 PID 文件失败", err
	}

	// 转换 PID
	pid, err := strconv.Atoi(string(pidData))
	if err != nil {
		return "PID 文件格式错误", err
	}

	// 获取进程
	proc, err := process.NewProcess(int32(pid))
	if err != nil {
		return "获取进程失败", err
	}

	// 检查进程是否运行
	isRunning, err := proc.IsRunning()
	if err != nil || !isRunning {
		return "进程不存在或已停止", nil
	}

	// 终止进程
	if err := proc.Terminate(); err != nil {
		return "关闭进程失败", err
	}

	// 删除 PID 文件
	if err := os.Remove(pidFile); err != nil {
		return "删除 PID 文件失败", err
	}

	return "机器人已停止", nil
}
