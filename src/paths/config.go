package paths

import (
	"log"
	"os"
	"path"
	"time"
)

// 获取机器人模板目录
func GetBotTemplate() string {
	return path.Join("resources")
}

// 获取工作目录
func GetWorkPath() string {
	return path.Join("work")
}

// go-process.json
func GetProcessConfigFilePath() string {
	workPath := GetWorkPath()
	filePath := path.Join(workPath, "go-process.json")
	return filePath
}

// 用户数据目录
func GetUserDataPath() (string, error) {
	userDataPath := path.Join(GetWorkPath(), "users")
	// 如果目录不存在，则创建
	if err := os.MkdirAll(userDataPath, 0755); err != nil {
		log.Printf("创建用户数据目录失败: %v", err)
		return "", err
	}
	return userDataPath, nil
}

// 获取资源目录
func GetResourcesPath() string {
	return path.Join(GetWorkPath(), "resources")
}

// 获取目录
func GetConfigsPath() string {
	configsPath := path.Join(GetWorkPath(), "configs")
	return configsPath
}

func GetConfigsPathByName(name string) string {
	configsPath := GetConfigsPath()
	return path.Join(configsPath, name+".yaml")
}

func GetBotsPath() string {
	resourcesPath := GetResourcesPath()
	botsPath := path.Join(resourcesPath, "bots")
	// 不存在要自动创建
	if _, err := os.Stat(botsPath); os.IsNotExist(err) {
		os.MkdirAll(botsPath, os.ModePerm)
	}
	return botsPath
}

// 获得指定名机器人的路径
func GetBotPath(name string) string {
	botsPath := GetBotsPath()
	return path.Join(botsPath, name)
}

func GetBotTemplatePath() string {
	resourcesPath := GetResourcesPath()
	// 模板路径
	templatePath := path.Join(resourcesPath, "template")
	return templatePath
}

func Exists(name string) bool {
	botPath := GetBotPath(name)
	_, err := os.Stat(botPath)
	return !os.IsNotExist(err)
}

// 获取指定名机器人的 PID 文件路径
func GetPidFilePath(name string) string {
	resourcesPath := GetResourcesPath()
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

func GetBotYarnJavaScriptPath() string {
	// 相对于当前机器人的
	return path.Join("..", "..", "bin", "yarn.cjs")
}

func GetBotPackagesPath(name string) string {
	botPath := GetBotPath(name)
	return path.Join(botPath, "packages")
}

// bot packages 路径
func GetBotPackagesPathByName(name string, appName string) string {
	botPath := GetBotPath(name)
	pkgPath := path.Join(botPath, "packages", appName)
	return pkgPath
}

// md
func GetBotPackagesMdPathByName(name string, appName string) string {
	pkgsPath := GetBotPackagesPathByName(name, appName)
	mdPath := path.Join(pkgsPath, "README.md")
	return mdPath
}

func GetBotPackagesGitPathByName(name string, appName string) string {
	pkgsPath := GetBotPackagesPathByName(name, appName)
	pkgPath := path.Join(pkgsPath, ".git")
	return pkgPath
}

func GetBotPackagesPKGFilePathByName(name string, appName string) string {
	pkgPath := path.Join(GetBotPackagesPathByName(name, appName), "package.json")
	return pkgPath
}

func GetBotNodeModulesPathByName(name string, pkgName string) string {
	botPath := GetBotPath(name)
	nodeModulesPath := path.Join(botPath, "node_modules", pkgName)
	return nodeModulesPath
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

func GetBotLogsPath(name string) string {
	botPath := GetBotPath(name)
	logPath := path.Join(botPath, "alemonjs", "log")
	return logPath
}

func GetBotLogByDate(name string, time time.Time) string {
	logsPath := GetBotLogsPath(name)
	today := time.Format("2006-01-02")
	logPath := path.Join(logsPath, today+".log")
	return logPath
}

func GetBotLogPath(name string) string {
	logPath := GetBotLogByDate(name, time.Now())
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

func GetSSHPath() (string, error) {
	// 获取用户目录
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	//SSH 路径
	sshPath := path.Join(homeDir, ".ssh")
	return sshPath, nil
}

func GetSSHAuthPathByName(name string) (string, error) {
	// 获取用户目录
	sshPath, err := GetSSHPath()
	if err != nil {
		return "", err
	}
	// 拼接 SSH 公钥路径
	sshAuthPath := path.Join(sshPath, name)
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
