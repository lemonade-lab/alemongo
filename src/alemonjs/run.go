package alemonjs

import (
	"io/ioutil"
	"os"
	"os/exec"
	"strconv"
)

// 运行机器人
func Run(name string) (string, error) {
	// 检查系统是否安装了 Node.js
	if _, err := exec.LookPath("node"); err != nil {
		return "未找到NodeJS", err
	}
	if IsRunning(name) {
		return "机器人已经在运行", nil
	}
	if !ExistsNodeModules(name) {
		return "请先安装依赖", os.ErrNotExist
	}
	// pid 文件路径
	pidFilePath := GetPidFilePath(name)
	// 启动脚本
	indexPath := GetBotIndexRelativePath()
	// 执行
	cmd := exec.Command("node", indexPath)
	// 设置工作目录为机器人的路径
	cmd.Dir = GetBotPath(name)
	// 设置命令的标准输入输出
	// cmd.Stdout = os.Stdout
	// cmd.Stderr = os.Stderr
	logPath := GetBotLogPath(name)
	// 把输出内容丢到指定log文件中
	logFile, err := os.OpenFile(logPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		return "打开日志文件失败", err
	}
	// 设置输出到日志文件
	cmd.Stdout = logFile
	cmd.Stderr = logFile
	if err := cmd.Start(); err != nil {
		// 启动失败。需要删除 pid 文件
		if err := os.Remove(pidFilePath); err != nil {
			return "删除pid文件失败", err
		}
		return "启动失败", err
	}
	// 保存 PID 到文件
	pid := cmd.Process.Pid
	if err := ioutil.WriteFile(pidFilePath, []byte(strconv.Itoa(pid)), 0644); err != nil {
		return "写入pid失败", err
	}
	return "", nil
}
