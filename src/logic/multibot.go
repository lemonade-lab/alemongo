package logic

import (
	"alemongo/src/core/process"
	"alemongo/src/models"
	config "alemongo/src/paths"
	"alemongo/src/utils"
	"errors"
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

	if !config.ExistsMultiBotNodeModules(name) {
		return "请先安装依赖", os.ErrNotExist
	}

	configFiles, err := os.ReadDir(multiBotConfigPath)
	if err != nil {
		return "读取多配置机器人配置文件失败", err
	}
	if len(configFiles) == 0 {
		return "多配置机器人配置文件不存在, 无法启动", nil
	}

	var startedCount int
	for _, configFile := range configFiles {
		if configFile.IsDir() {
			continue
		}
		ext := path.Ext(configFile.Name())
		// 仅处理 .yaml 或 .yml，其它后缀跳过
		if ext != ".yaml" && ext != ".yml" {
			continue
		}
		configName := configFile.Name()[:len(configFile.Name())-len(ext)]
		processName := fmt.Sprintf("%s:%s", name, configName)
		if pm.IsRunning(processName) {
			// 跳过已在运行的实例，继续启动其他的
			continue
		}
		// 使用相对于机器人工作目录的相对路径，alemonjs 会做 path.join(process.cwd(), CFG_PATH)
		configFileRelPath := path.Join("configs", configFile.Name())
		logPath := config.GetMultiBotLogPath(name, processName)
		pidFile := config.GetPidFilePath(processName)
		pm.AddProcess(process.NodeProcessConfig{
			Name:        processName,
			Dir:         multiBotPath,
			Node:        nodePath,
			ScriptJS:    indexPath,
			LogPath:     logPath,
			PidFile:     pidFile,
			EnvFilePath: config.GetMultiBotEnvPath(name),
			Env: map[string]string{
				"CFG_PATH": configFileRelPath,
			},
		})
		// 启动
		proc := pm.GetProcess(processName)
		if proc == nil {
			continue
		}
		if err := proc.Start(); err != nil {
			return fmt.Sprintf("启动配置 [%s] 失败", configName), err
		}
		startedCount++
	}
	if startedCount == 0 {
		return "没有新的实例需要启动（可能全部已在运行）", nil
	}
	return fmt.Sprintf("成功启动 %d 个实例", startedCount), nil
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
	var stoppedCount int
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

		// 获取并停止进程
		proc := pm.GetProcess(processName)
		if proc == nil {
			continue
		}
		if err := proc.Stop(); err != nil {
			return fmt.Sprintf("多配置机器人 [%s] 的配置 [%s] 实例停止失败", name, configName), err
		}
		stoppedCount++
	}
	return fmt.Sprintf("成功停止 %d 个实例", stoppedCount), nil
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
	var restartedCount int
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
		if proc == nil {
			continue
		}
		if err := proc.Restart(); err != nil {
			return fmt.Sprintf("多配置机器人 [%s] 的配置 [%s] 实例重启失败", name, configName), err
		}
		restartedCount++
	}
	return fmt.Sprintf("成功重启 %d 个实例", restartedCount), nil
}

// 删除多配置机器人
func DeleteMultiBot(name string) (string, error) {
	if name == "" {
		return "", errors.New("机器人名不能为空")
	}
	if !config.MultiBotExists(name) {
		return "", errors.New("多配置机器人不存在")
	}
	// 先停止所有实例
	StopMultiBot(name)
	// 删除目录
	multiBotPath := config.GetMultiBotPath(name)
	if err := os.RemoveAll(multiBotPath); err != nil {
		return "", errors.New("删除多配置机器人失败")
	}
	return multiBotPath, nil
}

// 多配置机器人信息
func MultiBotInfo(name string) (models.BotInfoResponse, error) {
	multiBotPath := config.GetMultiBotPath(name)
	nodeModules := config.ExistsMultiBotNodeModules(name)

	fileInfo, err := os.Stat(multiBotPath)
	createAt := ""
	if err == nil {
		createAt = fileInfo.ModTime().Format("2006-01-02 15:04:05")
	}

	return models.BotInfoResponse{
		Code: 0,
		Msg:  "获取成功",
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

// 多配置机器人安装依赖
func MultiBotYarnInstall(name string) (string, error) {
	if name == "" {
		return "", errors.New("机器人名不能为空")
	}
	if !config.MultiBotExists(name) {
		return "", errors.New("多配置机器人不存在")
	}
	msg, err := MultiBotInstall(name)
	if err != nil {
		return msg, err
	}
	return "", nil
}

// MultiBotInstall 在多配置机器人目录执行 yarn install
func MultiBotInstall(name string) (string, error) {
	if _, err := exec.LookPath("node"); err != nil {
		return "未找到NodeJS", err
	}
	// yarn.cjs
	cliDir := config.GetBotYarnJavaScriptPath()
	cmd := utils.Command("node", cliDir, "install", "--ignore-engines")
	cmd.Dir = config.GetMultiBotPath(name)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		if exitError, ok := err.(*exec.ExitError); ok && exitError.ExitCode() == 0 {
			return "依赖安装成功", nil
		}
		return fmt.Sprintf("依赖安装异常: %v", err), err
	}
	return "依赖安装成功", nil
}

// 启动单个实例
func StartMultiBotInstance(name, configName string) (string, error) {
	nodePath, err := exec.LookPath("node")
	if err != nil {
		return "未找到NodeJS", err
	}
	pm := process.GetProcessManager()
	processName := fmt.Sprintf("%s:%s", name, configName)
	if pm.IsRunning(processName) {
		return "该实例已在运行", nil
	}
	if !config.ExistsMultiBotNodeModules(name) {
		return "请先安装依赖", os.ErrNotExist
	}
	multiBotPath := config.GetMultiBotPath(name)

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
		return "启动脚本不存在", os.ErrNotExist
	}

	// 查找配置文件
	multiBotConfigPath := path.Join(multiBotPath, "configs")
	var configFileName string
	for _, ext := range []string{".yaml", ".yml"} {
		fp := filepath.Join(multiBotConfigPath, configName+ext)
		if _, err := os.Stat(fp); err == nil {
			configFileName = configName + ext
			break
		}
	}
	if configFileName == "" {
		return "配置文件不存在", errors.New("配置文件不存在")
	}

	// 使用相对于机器人工作目录的相对路径，alemonjs 会做 path.join(process.cwd(), CFG_PATH)
	configFileRelPath := filepath.Join("configs", configFileName)
	logPath := config.GetMultiBotLogPath(name, processName)
	pidFile := config.GetPidFilePath(processName)
	pm.AddProcess(process.NodeProcessConfig{
		Name:        processName,
		Dir:         multiBotPath,
		Node:        nodePath,
		ScriptJS:    indexPath,
		LogPath:     logPath,
		PidFile:     pidFile,
		EnvFilePath: config.GetMultiBotEnvPath(name),
		Env: map[string]string{
			"CFG_PATH": configFileRelPath,
		},
	})
	proc := pm.GetProcess(processName)
	if proc == nil {
		return "进程未注册", os.ErrNotExist
	}
	if err := proc.Start(); err != nil {
		return "启动失败", err
	}
	return "启动成功", nil
}

// 停止单个实例
func StopMultiBotInstance(name, configName string) (string, error) {
	pm := process.GetProcessManager()
	processName := fmt.Sprintf("%s:%s", name, configName)
	proc := pm.GetProcess(processName)
	if proc == nil {
		return "进程未注册", errors.New("进程不存在")
	}
	if err := proc.Stop(); err != nil {
		return "停止失败", err
	}
	return "已停止", nil
}

// 重启单个实例
func RestartMultiBotInstance(name, configName string) (string, error) {
	pm := process.GetProcessManager()
	processName := fmt.Sprintf("%s:%s", name, configName)
	proc := pm.GetProcess(processName)
	if proc == nil {
		return "进程未注册", errors.New("进程不存在")
	}
	if err := proc.Restart(); err != nil {
		return "重启失败", err
	}
	return "已重启", nil
}
