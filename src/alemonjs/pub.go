package alemonjs

import (
	"alemongo/src/config"
	"io/ioutil"
	"os"
	"path"
	"strconv"

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
