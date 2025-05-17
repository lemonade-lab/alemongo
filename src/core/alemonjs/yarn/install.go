package yarn

import (
	"alemongo/src/core/alemonjs"
	"alemongo/src/utils"
	"fmt"
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
	if alemonjs.IsRunning(name) {
		return "机器人在运行", os.ErrExist
	}
	// yarn.cjs
	cliDir := path.Join("..", "bin", "yarn.cjs")
	// yanr install
	cmd := utils.Command("node", cliDir, "install", "--ignore-engines")
	// 设置工作目录为机器人的路径
	cmd.Dir = alemonjs.GetBotPath(name)
	// cmd.Stdout = os.Stdout
	// cmd.Stderr = os.Stderr
	logPath := alemonjs.GetBotLogPath(name)
	// 把输出内容丢到指定log文件中
	logFile, err := os.OpenFile(logPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		return "打开日志文件失败", err
	}
	defer logFile.Close()
	cmd.Stdout = logFile
	cmd.Stderr = logFile
	// 执行命令
	if err := cmd.Run(); err != nil {
		// 分析错误。如果只是依赖的一些警告不应当做为错误
		if exitError, ok := err.(*exec.ExitError); ok && exitError.ExitCode() == 0 {
			return "依赖安装成功 (Dependencies installed successfully)", nil
		}
		return fmt.Sprintf("依赖安装异常: %v (Dependency installation failed: %v)", err, err), err
	}
	return "依赖安装成功 (Dependencies installed successfully)", nil
}
