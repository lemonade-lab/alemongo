package alemonjs

import (
	"alemongo/src/core/process"
	"alemongo/src/settings"
	"os"
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

func GetBotConfigPath(name string) string {
	botPath := GetBotPath(name)
	return path.Join(botPath, "alemon.config.yaml")
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
