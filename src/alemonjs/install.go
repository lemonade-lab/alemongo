package alemonjs

import (
	"os"
	"os/exec"
	"path"
)

// 加载依赖
func Install(name string) (string, error) {
	// 检查系统是否安装了 Node.js
	if _, err := exec.LookPath("node"); err != nil {
		return "未找到NodeJS", err
	}
	if IsRunning(name) {
		return "机器人在运行", os.ErrExist
	}
	// yarn.cjs
	cliDir := path.Join("..", "bin", "yarn.cjs")
	// yanr install
	cmd := exec.Command("node", cliDir, "install", "--ignore-engines")
	// 设置工作目录为机器人的路径
	cmd.Dir = GetBotPath(name)
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
	// 执行命令
	if err := cmd.Run(); err != nil {
		return "依赖安装失败", err
	}
	return "依赖安装成功", nil
}
