package logic

import (
	"alemongo/src/core/process"
	config "alemongo/src/paths"
	"fmt"
	"os"
	"os/exec"
	"path"
	"path/filepath"
)

// 运行机器人
func RunMultiBot(name string) (string, error) {
	// 检查系统是否安装了 Node.js
	nodePath, err := exec.LookPath("node")
	if err != nil {
		return "未找到NodeJS", err
	}
	pm := process.GetProcessManager()
	// 机器人目录
	multiBotPath := config.GetMultiBotPath(name)
	multiBotConfigPath := path.Join(multiBotPath, "configs")
	if _, err = os.Stat(multiBotConfigPath); os.IsNotExist(err) {
		return "多配置机器人配置文件不存在", err
	}

	var indexPath string
	tryFiles := []string{
		path.Join("alemonjs", "index.js"),
		"index.js",
		path.Join("src", "index.js"),
		path.Join("lib", "index.js"),
	}
	found := false
	for _, fp := range tryFiles {
		if _, err := os.Stat(path.Join(multiBotPath, fp)); err == nil {
			indexPath = fp
			found = true
			break
		}
	}
	if !found {
		return "启动脚本不存在,请新建index.js", os.ErrNotExist
	}

	configFiles, err := os.ReadDir(multiBotConfigPath)
	if err != nil {
		return "读取多配置机器人配置文件失败", err
	}
	if len(configFiles) == 0 {
		return "多配置机器人配置文件不存在, 无法启动", nil
	}
	for _, configFile := range configFiles {
		if configFile.IsDir() {
			continue
		}
		ext := path.Ext(configFile.Name())
		if ext != ".yaml" || ext != ".yml" {
			continue
		}
		configName := configFile.Name()[:len(configFile.Name())-len(ext)]
		processName := fmt.Sprintf("%s:%s", name, configName)
		if pm.IsRunning(processName) {
			return fmt.Sprintf("多配置机器人 [%s] 的配置 [%s] 实例已经在运行", name, configName), nil
		}
		if !config.ExistsNodeModules(name) {
			return "请先安装依赖", os.ErrNotExist
		}
		//configFilePath := path.Join(multiBotConfigPath, configFile.Name())
		logPath := config.GetMultiBotLogPath(name, processName)
		pidFile := config.GetPidFilePath(processName)
		pm.AddProcess(process.NodeProcessConfig{
			Name:        name,
			Dir:         multiBotPath,
			Node:        nodePath,
			ScriptJS:    indexPath,
			LogPath:     logPath,
			PidFile:     pidFile,
			EnvFilePath: config.GetBotEnvPath(name),
			// 支持直接加环境变量
			Env: map[string]string{
				// 关闭日志时间
				// "LOGGER_TIME": "false",
				// 关闭日志级别
				// "LOGGER_LEVEL": "false",
			},
		})
		// 启动
		proc := pm.GetProcess(processName)
		if proc == nil {
			return "进程未注册", os.ErrNotExist
		}
		err = proc.Start()
		if err != nil {
			return "启动失败", err
		}
		return "", nil
	}
	return "", nil
}

// 停止机器人
func StopMultiBot(name string) (string, error) {
	pm := process.GetProcessManager()
	multiBotPath := config.GetMultiBotPath(name)
	multiBotConfigPath := path.Join(multiBotPath, "configs")
	if _, err := os.Stat(multiBotConfigPath); os.IsNotExist(err) {
		return "多配置机器人配置目录不存在", os.ErrNotExist
	}
	files, err := os.ReadDir(multiBotConfigPath)
	if err != nil {
		return "读取多配置机器人配置目录失败", err
	}
	if len(files) == 0 {
		return "多配置机器人配置文件不存在, 无法停止", nil
	}
	for _, file := range files {
		if file.IsDir() {
			continue
		}
		ext := filepath.Ext(file.Name())
		if ext != ".yaml" && ext != ".yml" {
			continue
		}

		configName := file.Name()[:len(file.Name())-len(ext)]
		processName := fmt.Sprintf("%s@%s", name, configName)

		// 获取并停止进程
		proc := pm.GetProcess(processName)
		if proc != nil {
			return fmt.Sprintf("多配置机器人 [%s] 的配置 [%s] 实例不存在", name, configName), os.ErrNotExist
		}
		err := proc.Stop()
		if err != nil {
			return fmt.Sprintf("多配置机器人 [%s] 的配置 [%s] 实例停止失败", name, configName), err
		}
	}
	return "", nil
}

func RestartMultiBot(name string) (string, error) {
	pm := process.GetProcessManager()
	multiBotPath := config.GetMultiBotPath(name)
	multiBotConfigPath := path.Join(multiBotPath, "configs")
	if _, err := os.Stat(multiBotConfigPath); os.IsNotExist(err) {
		return "多配置机器人配置目录不存在", os.ErrNotExist
	}
	files, err := os.ReadDir(multiBotConfigPath)
	if err != nil {
		return "读取多配置机器人配置目录失败", err
	}
	if len(files) == 0 {
		return "多配置机器人配置文件不存在, 无法重启", nil
	}
	for _, file := range files {
		if file.IsDir() {
			continue
		}
		ext := filepath.Ext(file.Name())
		if ext != ".yaml" && ext != ".yml" {
			continue
		}
		configName := file.Name()[:len(file.Name())-len(ext)]
		processName := fmt.Sprintf("%s:%s", name, configName)
		proc := pm.GetProcess(processName)
		if proc != nil {
			return "进程未注册", os.ErrNotExist
		}
		err := proc.Start()
		if err != nil {
			return fmt.Sprintf("多配置机器人 [%s] 的配置 [%s] 实例重启失败", name, configName), err
		}
	}
	return "", nil
}
