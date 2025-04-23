package alemonjs

import (
	"alemongo/src/config"
	"io/ioutil"
	"os"
	"path"
	"strconv"
	"time"

	"github.com/shirou/gopsutil/v3/process"
)

func GetBotPath(name string) string {
	resourcesPath := config.GetResourcesPath()
	return path.Join(resourcesPath, name)
}

func GetPidFilePath(name string) string {
	botPath := GetBotPath(name)
	return path.Join(botPath, "alemonjs", name+".pid")
}

func GetBotIndexRelativePath() string {
	return path.Join("alemonjs", "index.js")
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

func IsRunning(name string) bool {
	pidFilePath := GetPidFilePath(name)
	if _, err := os.Stat(pidFilePath); err == nil {
		// 数据
		pidData, err := ioutil.ReadFile(pidFilePath)
		if err != nil {
			return false
		}
		// 转换 PID
		pid, err := strconv.Atoi(string(pidData))
		if err != nil {
			return false
		}
		proc, err := process.NewProcess(int32(pid))
		if err != nil {
			return false
		}
		// 检查进程是否运行
		isRunning, err := proc.IsRunning()
		if err != nil {
			return false
		}
		if isRunning {
			// 进程存在
			return true
		}
		return false

	}
	return false
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
