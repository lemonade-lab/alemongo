package logic

import (
	"alemongo/src/core/process"
	"alemongo/src/models"
	"alemongo/src/settings"
	"os"
	"os/exec"
	"path"
	"time"
)

func GetBotPath(name string) string {
	resourcesPath := settings.GetResourcesPath()
	return path.Join(resourcesPath, name)
}

func GetPidFilePath(name string) string {
	resourcesPath := settings.GetResourcesPath()
	return path.Join(resourcesPath, "process", name+".pid")
}

func GetBotPKGPath(name string) string {
	botPath := GetBotPath(name)
	return path.Join(botPath, "package.json")
}

func GetBotEnvPath(name string) string {
	botPath := GetBotPath(name)
	return path.Join(botPath, ".env")
}

func GetBotConfigPath(name string) string {
	botPath := GetBotPath(name)
	configPath := path.Join(botPath, "alemon.config.yaml")
	return configPath
}

func Exists(name string) bool {
	botPath := GetBotPath(name)
	_, err := os.Stat(botPath)
	return !os.IsNotExist(err)
}

func ExistsNodeModules(name string) bool {
	botPath := GetBotPath(name)
	nodeModulesPath := path.Join(botPath, "node_modules")
	_, err := os.Stat(nodeModulesPath)
	// 还需要存在 yarn.lock
	yarnLockPath := path.Join(botPath, "yarn.lock")
	_, err2 := os.Stat(yarnLockPath)
	return !os.IsNotExist(err) && !os.IsNotExist(err2)
}

// 判断机器人是否在运行
func IsRunning(name string) bool {
	pm := process.GetProcessManager()
	return pm.IsRunning(name)
}

func GetBotLogPath(name string) string {
	botPath := GetBotPath(name)
	today := time.Now().Format("2006-01-02")
	logPath := path.Join(botPath, "alemonjs", "log", today+".log")
	// 判断是否存在，不存在。写入空文件
	if _, err := os.Stat(logPath); os.IsNotExist(err) {
		// 得到该文件的目录
		dir := path.Dir(logPath)
		// 判断目录是否存在
		if _, err := os.Stat(dir); os.IsNotExist(err) {
			// 创建目录
			if err := os.MkdirAll(dir, os.ModePerm); err != nil {
				// 创建目录失败
			}
		}
		// 创建文件
		file, err := os.Create(logPath)
		if err != nil {
			// 创建文件失败
		}
		defer file.Close()
	}
	return logPath
}

func GetBotLogByDate(name string, date time.Time) string {
	botPath := GetBotPath(name)
	today := date.Format("2006-01-02")
	return path.Join(botPath, "alemonjs", "log", today+".log")
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
	if !ExistsNodeModules(name) {
		return "请先安装依赖", os.ErrNotExist
	}
	// 机器人目录
	botPath := GetBotPath(name)
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
	// 日志和 PID 文件路径
	logPath := GetBotLogPath(name)
	pidFile := GetPidFilePath(name)
	// 交给进程管理器托管
	pm.AddProcess(process.NodeProcessConfig{
		Name:        name,
		Dir:         botPath,
		Node:        nodePath,
		ScriptJS:    indexPath,
		LogPath:     logPath,
		PidFile:     pidFile,
		EnvFilePath: GetBotEnvPath(name),
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
	botPath := GetBotPath(name)
	nodeModules := ExistsNodeModules(name)

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
			NodeModules: nodeModules,
			CreateAt:    createAt,
		},
	}, nil
}
