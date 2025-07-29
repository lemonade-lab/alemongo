package logic

import (
	"alemongo/src/core/process"
	"alemongo/src/models"
	config "alemongo/src/paths"
	"os"
	"os/exec"
	"path"
)

// 判断机器人是否在运行
func IsRunning(name string) bool {
	pm := process.GetProcessManager()
	return pm.IsRunning(name)
}

// 运行机器人
func Run(name string) (string, error) {
	// 检查系统是否安装了 Node.js
	nodePath, err := exec.LookPath("node")
	if err != nil {
		return "未找到NodeJS", err
	}
	pm := process.GetProcessManager()
	if pm.IsRunning(name) {
		return "机器人已经在运行", nil
	}
	if !config.ExistsNodeModules(name) {
		return "请先安装依赖", os.ErrNotExist
	}
	// 机器人目录
	botPath := config.GetBotPath(name)
	var indexPath string
	tryFiles := []string{
		path.Join("alemonjs", "index.js"),
		"index.js",
		path.Join("src", "index.js"),
		path.Join("lib", "index.js"),
	}
	found := false
	for _, fp := range tryFiles {
		if _, err := os.Stat(path.Join(botPath, fp)); err == nil {
			indexPath = fp
			found = true
			break
		}
	}
	if !found {
		return "启动脚本不存在,请新建index.js", os.ErrNotExist
	}

	runConfig := ReadBotConfig(name)

	// port 被占用的前提是。URL 不为空
	port := 0
	if runConfig.URL == "" {
		port = runConfig.Port
	}

	// 日志和 PID 文件路径
	logPath := config.GetBotLogPath(name)
	pidFile := config.GetPidFilePath(name)
	// 交给进程管理器托管
	pm.AddProcess(process.NodeProcessConfig{
		Name:        name,
		Dir:         botPath,
		Node:        nodePath,
		ScriptJS:    indexPath,
		LogPath:     logPath,
		PidFile:     pidFile,
		EnvFilePath: config.GetBotEnvPath(name),
		Port:        port, // 使用配置的端口
		// 支持直接加环境变量
		Env: map[string]string{
			// 关闭日志时间
			// "LOGGER_TIME": "false",
			// 关闭日志级别
			// "LOGGER_LEVEL": "false",
		},
	})
	// 启动
	proc := pm.GetProcess(name)
	if proc == nil {
		return "进程未注册", os.ErrNotExist
	}
	err = proc.Start()
	if err != nil {
		return "启动失败", err
	}
	return "", nil
}

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

func Info(name string) (models.BotInfoResponse, error) {
	botPath := config.GetBotPath(name)
	nodeModules := config.ExistsNodeModules(name)

	// 获取文件夹创建时间
	fileInfo, err := os.Stat(botPath)
	createAt := ""
	if err == nil {
		createAt = fileInfo.ModTime().Format("2006-01-02 15:04:05")
	}

	pm := process.GetProcessManager()

	proc := pm.GetProcess(name)
	if proc == nil {
		return models.BotInfoResponse{
			Code: 0,
			Msg:  "进程未注册",
			Data: models.BotInfo{
				Name:        name,
				Status:      0,
				Pid:         0,
				Port:        0,
				NodeModules: nodeModules,
				CreateAt:    createAt,
			},
		}, nil
	}

	status, pid := proc.Info()
	if status == "running" && pid > 0 {
		return models.BotInfoResponse{
			Code: 1,
			Msg:  "获取进程信息成功",
			Data: models.BotInfo{
				Name:        name,
				Status:      1,
				Pid:         pid,
				Port:        proc.Config.Port,
				NodeModules: nodeModules,
				CreateAt:    createAt,
			},
		}, nil
	}
	return models.BotInfoResponse{
		Code: 0,
		Msg:  "进程未运行",
		Data: models.BotInfo{
			Name:        name,
			Status:      0,
			Pid:         0,
			Port:        0,
			NodeModules: nodeModules,
			CreateAt:    createAt,
		},
	}, nil
}
