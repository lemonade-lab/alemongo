package yarn

import (
	"alemongo/src/core/alemonjs"
	"alemongo/src/utils"
	"os"
	"os/exec"
	"path"
)

// 加载依赖
func Add(name string, args []string) (string, error) {
	// 检查系统是否安装了 Node.js
	if _, err := exec.LookPath("node"); err != nil {
		return "未找到 Node.js，请先安装 Node.js", err
	}

	// 检查机器人是否正在运行
	if alemonjs.IsRunning(name) {
		return "机器人正在运行，请先停止机器人", os.ErrExist
	}

	// 检查是否提供了依赖名称
	if len(args) == 0 {
		return "未提供依赖名称", os.ErrInvalid
	}

	// 检查机器人是否正在运行
	if alemonjs.IsRunning(name) {
		return "机器人正在运行，请先停止机器人", os.ErrExist
	}

	// 检查是否提供了依赖名称
	if len(args) == 0 {
		return "未提供依赖名称", os.ErrInvalid
	}

	// yarn.cjs 路径
	cliDir := path.Join("..", "bin", "yarn.cjs")

	// 构建命令
	curArgs := append([]string{"add", "-W"}, args...)
	cmd := utils.Command("node", append([]string{cliDir}, curArgs...)...)

	// 设置工作目录为机器人的路径
	cmd.Dir = alemonjs.GetBotPath(name)

	// 获取日志文件路径
	logPath := alemonjs.GetBotLogPath(name)
	// 打开日志文件
	logFile, err := os.OpenFile(logPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		return "打开日志文件失败", err
	}
	defer logFile.Close() // 确保文件在函数结束时关闭

	// 设置命令的输出到日志文件
	cmd.Stdout = logFile
	cmd.Stderr = logFile

	// 执行命令
	if err := cmd.Run(); err != nil {
		return "依赖安装异常，请检查日志文件获取详细信息", err
	}

	return "依赖安装成功", nil
}
