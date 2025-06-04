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

	var l = new(zapcore.Level)
	if err := l.UnmarshalText([]byte(settings.Conf.Log.Level)); err != nil {
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
		return "依赖安装异常，请检查日志文件获取详细信息", err
	}

	return "依赖安装成功", nil
}
