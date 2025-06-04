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
	var l = new(zapcore.Level)
	if err := l.UnmarshalText([]byte(settings.Conf.Log.Level)); err != nil {
		fmt.Printf("unable to unmarshal zapcore.Level: %v\n", err)
	}

	botLogger, err := logger.GetOrCreateBotLogger(name, *l)
	if err != nil {
		fmt.Printf("unable to create logger: %v\n", err)
	}
	botLoggerWriter := logger.NewRobotLoggerWriter(botLogger)

	cmd.Stdout = botLoggerWriter.Writer()
	cmd.Stderr = botLoggerWriter.Writer()
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
