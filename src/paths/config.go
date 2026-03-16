package paths

import (
	"log"
	"os"
	"path/filepath"
	"time"
)

// 获取机器人模板目录
func GetBotTemplate() string {
	return filepath.Join("resources")
}

// 获取工作目录
func GetWorkPath() string {
	return filepath.Join("work")
}

// go-process.json
func GetProcessConfigFilePath() string {
	workPath := GetWorkPath()
	filePath := filepath.Join(workPath, "go-process.json")
	return filePath
}

// 用户数据目录
func GetUserDataPath() (string, error) {
	userDataPath := filepath.Join(GetWorkPath(), "users")
	// 如果目录不存在，则创建
	if err := os.MkdirAll(userDataPath, 0755); err != nil {
		log.Printf("创建用户数据目录失败: %v", err)
		return "", err
	}
	return userDataPath, nil
}

// 获取资源目录
func GetResourcesPath() string {
	return filepath.Join(GetWorkPath(), "resources")
}

// 获取目录
func GetConfigsPath() string {
	configsPath := filepath.Join(GetWorkPath(), "configs")
	return configsPath
}

func GetConfigsPathByName(name string) string {
	configsPath := GetConfigsPath()
	return filepath.Join(configsPath, name+".yaml")
}

func GetBotsPath() string {
	resourcesPath := GetResourcesPath()
	botsPath := filepath.Join(resourcesPath, "bots")
	// 不存在要自动创建
	if _, err := os.Stat(botsPath); os.IsNotExist(err) {
		if err := os.MkdirAll(botsPath, 0755); err != nil {
			log.Printf("创建 bots 目录失败: %v", err)
		}
	}
	return botsPath
}

func GetMultiBotsPath() string {
	resourcesPath := GetResourcesPath()
	multiBotsPath := filepath.Join(resourcesPath, "multibots")
	if _, err := os.Stat(multiBotsPath); os.IsNotExist(err) {
		if err := os.MkdirAll(multiBotsPath, 0755); err != nil {
			log.Printf("创建多配置机器人目录失败: %v\n", err.Error())
		}
	}
	return multiBotsPath
}

// 获得指定名机器人的路径
func GetBotPath(name string) string {
	botsPath := GetBotsPath()
	return filepath.Join(botsPath, name)
}

// 获得指定多配置机器人的路径
func GetMultiBotPath(name string) string {
	multiBotsPath := GetMultiBotsPath()
	return filepath.Join(multiBotsPath, name)
}

func GetBotTemplatePath() string {
	resourcesPath := GetResourcesPath()
	// 模板路径
	templatePath := filepath.Join(resourcesPath, "template")
	return templatePath
}

func Exists(name string) bool {
	botPath := GetBotPath(name)
	_, err := os.Stat(botPath)
	return !os.IsNotExist(err)
}

func MultiBotExists(name string) bool {
	multiBotPath := GetMultiBotPath(name)
	_, err := os.Stat(multiBotPath)
	return !os.IsNotExist(err)
}

// 获取指定名机器人的 PID 文件路径
func GetPidFilePath(name string) string {
	resourcesPath := GetResourcesPath()
	return filepath.Join(resourcesPath, "process", name+".pid")
}

func GetBotPKGPath(name string) string {
	botPath := GetBotPath(name)
	return filepath.Join(botPath, "package.json")
}

func GetBotEnvPath(name string) string {
	botPath := GetBotPath(name)
	return filepath.Join(botPath, ".env")
}

func GetBotConfigPath(name string) string {
	botPath := GetBotPath(name)
	configPath := filepath.Join(botPath, "alemon.config.yaml")
	return configPath
}

func GetMultiBotConfigPath(name string) string {
	multiBotPath := GetMultiBotPath(name)
	configPath := filepath.Join(multiBotPath, "configs")
	return configPath
}

func GetBotYarnJavaScriptPath() string {
	// 相对于当前机器人的
	return filepath.Join("..", "..", "bin", "yarn.cjs")
}

func GetBotPackagesPath(name string) string {
	botPath := GetBotPath(name)
	return filepath.Join(botPath, "packages")
}

// bot packages 路径
func GetBotPackagesPathByName(name string, appName string) string {
	botPath := GetBotPath(name)
	pkgPath := filepath.Join(botPath, "packages", appName)
	return pkgPath
}

// md
func GetBotPackagesMdPathByName(name string, appName string) string {
	pkgsPath := GetBotPackagesPathByName(name, appName)
	mdPath := filepath.Join(pkgsPath, "README.md")
	return mdPath
}

func GetBotPackagesGitPathByName(name string, appName string) string {
	pkgsPath := GetBotPackagesPathByName(name, appName)
	pkgPath := filepath.Join(pkgsPath, ".git")
	return pkgPath
}

func GetBotPackagesPKGFilePathByName(name string, appName string) string {
	pkgPath := filepath.Join(GetBotPackagesPathByName(name, appName), "package.json")
	return pkgPath
}

func GetBotNodeModulesPathByName(name string, pkgName string) string {
	botPath := GetBotPath(name)
	nodeModulesPath := filepath.Join(botPath, "node_modules", pkgName)
	return nodeModulesPath
}

func ExistsNodeModules(name string) bool {
	botPath := GetBotPath(name)
	nodeModulesPath := filepath.Join(botPath, "node_modules")
	_, err := os.Stat(nodeModulesPath)
	// 还需要存在 yarn.lock
	yarnLockPath := filepath.Join(botPath, "yarn.lock")
	_, err2 := os.Stat(yarnLockPath)
	return !os.IsNotExist(err) && !os.IsNotExist(err2)
}

func ExistsMultiBotNodeModules(name string) bool {
	botPath := GetMultiBotPath(name)
	nodeModulesPath := filepath.Join(botPath, "node_modules")
	_, err := os.Stat(nodeModulesPath)
	return !os.IsNotExist(err)
}

// ===== 多配置机器人 packages 路径 =====

func GetMultiBotPackagesPath(name string) string {
	multiBotPath := GetMultiBotPath(name)
	return filepath.Join(multiBotPath, "packages")
}

func GetMultiBotPackagesPathByName(name string, appName string) string {
	multiBotPath := GetMultiBotPath(name)
	return filepath.Join(multiBotPath, "packages", appName)
}

func GetMultiBotPackagesMdPathByName(name string, appName string) string {
	pkgsPath := GetMultiBotPackagesPathByName(name, appName)
	return filepath.Join(pkgsPath, "README.md")
}

func GetMultiBotPackagesGitPathByName(name string, appName string) string {
	pkgsPath := GetMultiBotPackagesPathByName(name, appName)
	return filepath.Join(pkgsPath, ".git")
}

func GetMultiBotPackagesPKGFilePathByName(name string, appName string) string {
	return filepath.Join(GetMultiBotPackagesPathByName(name, appName), "package.json")
}

func GetMultiBotNodeModulesPathByName(name string, pkgName string) string {
	multiBotPath := GetMultiBotPath(name)
	return filepath.Join(multiBotPath, "node_modules", pkgName)
}

func GetMultiBotEnvPath(name string) string {
	multiBotPath := GetMultiBotPath(name)
	return filepath.Join(multiBotPath, ".env")
}

func GetMultiBotPKGPath(name string) string {
	multiBotPath := GetMultiBotPath(name)
	return filepath.Join(multiBotPath, "package.json")
}

func GetBotLogsPath(name string) string {
	botPath := GetBotPath(name)
	logPath := filepath.Join(botPath, "alemonjs", "log")
	return logPath
}

func GetBotLogByDate(name string, time time.Time) string {
	logsPath := GetBotLogsPath(name)
	today := time.Format("2006-01-02")
	logPath := filepath.Join(logsPath, today+".log")
	return logPath
}

func GetBotLogPath(name string) string {
	logPath := GetBotLogByDate(name, time.Now())
	// 判断是否存在，不存在。写入空文件
	if _, err := os.Stat(logPath); os.IsNotExist(err) {
		// 得到该文件的目录
		dir := filepath.Dir(logPath)
		// 判断目录是否存在
		if _, err := os.Stat(dir); os.IsNotExist(err) {
			// 创建目录
			if err := os.MkdirAll(dir, 0755); err != nil {
				log.Printf("创建日志目录失败: %v", err)
				return logPath
			}
		}
		// 创建文件
		file, err := os.Create(logPath)
		if err != nil {
			log.Printf("创建日志文件失败: %v", err)
			return logPath
		}
		file.Close()
	}
	return logPath
}

func GetMultiBotLogsPath(name string) string {
	multiBotsPath := GetMultiBotPath(name)
	logPath := filepath.Join(multiBotsPath, "alemonjs", "log")
	return logPath
}

func GetMultiBotLogByDate(name, processName string, time time.Time) string {
	logsPath := GetMultiBotLogsPath(name)
	today := time.Format("2006-01-02")
	logPath := filepath.Join(logsPath, processName, today+".log")
	return logPath
}

func GetMultiBotLogPath(name, processName string) string {
	logPath := GetMultiBotLogByDate(name, processName, time.Now())
	// 判断是否存在，不存在。写入空文件
	if _, err := os.Stat(logPath); os.IsNotExist(err) {
		// 得到该文件的目录
		dir := filepath.Dir(logPath)
		// 判断目录是否存在
		if _, err := os.Stat(dir); os.IsNotExist(err) {
			// 创建目录
			if err := os.MkdirAll(dir, 0755); err != nil {
				log.Printf("创建日志目录失败: %v", err)
				return logPath
			}
		}
		// 创建文件
		file, err := os.Create(logPath)
		if err != nil {
			log.Printf("创建日志文件失败: %v", err)
			return logPath
		}
		file.Close()
	}
	return logPath
}

func GetSSHPath() (string, error) {
	// 获取用户目录
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	// SSH 路径
	sshPath := filepath.Join(homeDir, ".ssh")

	// 确保 SSH 目录存在且权限正确
	if _, err := os.Stat(sshPath); os.IsNotExist(err) {
		if err := os.MkdirAll(sshPath, 0700); err != nil {
			return "", err
		}
	} else {
		// 检查权限，SSH 目录必须是 0700
		if err := os.Chmod(sshPath, 0700); err != nil {
			log.Printf("设置 SSH 目录权限失败: %v", err)
		}
	}

	return sshPath, nil
}

func GetSSHAuthPathByName(name string) (string, error) {
	// 获取用户目录
	sshPath, err := GetSSHPath()
	if err != nil {
		return "", err
	}
	// 拼接 SSH 公钥路径
	sshAuthPath := filepath.Join(sshPath, name)
	return sshAuthPath, nil
}

func GetSSHAuthPath() (string, error) {
	// 获取用户目录
	sshAuthPath, err := GetSSHAuthPathByName("id_rsa")
	if err != nil {
		return "", err
	}
	return sshAuthPath, nil
}
