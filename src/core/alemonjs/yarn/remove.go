package yarn

import (
	"alemongo/src/core/alemonjs"
	"alemongo/src/logger"
	"alemongo/src/settings"
	"alemongo/src/utils"
	"fmt"
	"go.uber.org/zap/zapcore"
	"os"
	"os/exec"
	"path"
)

// 移除依赖
func Remove(name string, names []string) (string, error) {
	// 检查系统是否安装了 Node.js
	if _, err := exec.LookPath("node"); err != nil {
		return "未找到 Node.js，请先安装 Node.js", err
	}

	// 检查是否提供了依赖名称
	if len(names) == 0 {
		return "未提供依赖名称", os.ErrInvalid
	}

	// 检查机器人是否正在运行
	if alemonjs.IsRunning(name) {
		return "机器人正在运行，请先停止机器人", os.ErrExist
	}

	// yarn.cjs 路径
	cliDir := path.Join("..", "bin", "yarn.cjs")

	// 构建命令
	args := append([]string{"remove", "-W"}, names...)
	cmd := utils.Command("node", append([]string{cliDir}, args...)...)

	// 设置工作目录为机器人的路径
	cmd.Dir = alemonjs.GetBotPath(name)

	var l = new(zapcore.Level)
	if err := l.UnmarshalText([]byte(settings.Conf.Level)); err != nil {
		fmt.Printf("unable to unmarshal zapcore.Level: %v\n", err)
	}

	botLogger, err := logger.GetOrCreateBotLogger(name, *l)
	if err != nil {
		fmt.Printf("unable to create logger: %v\n", err)
	}
	botLoggerWriter := logger.NewRobotLoggerWriter(botLogger)

	// 设置命令的输出到日志文件
	cmd.Stdout = botLoggerWriter.Writer()
	cmd.Stderr = botLoggerWriter.Writer()

	// 执行命令
	if err := cmd.Run(); err != nil {
		return "依赖移除异常，请检查日志文件获取详细信息", err
	}

	return "依赖移除成功", nil
}
