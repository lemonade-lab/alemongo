package logic

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"alemongo/src/settings"
	"errors"
	"os"
	"path"
)

func CreateBot(name string) (string, response.ResCode) {
	// 资源路径
	resourcesPath := settings.GetResourcesPath()
	// 目标路径
	targetPath := path.Join(resourcesPath, name)
	// 检查是否存在目录 ./resources/{name}
	if _, err := os.Stat(targetPath); err == nil {
		return "", response.RobotAlreadyExist
	}

	return dao.CreateBot(name, targetPath, resourcesPath)
}

func DeleteBot(name string) (string, error) {
	if name == "" {
		return "", errors.New("机器人名不能为空")
	}
	if !Exists(name) {
		return "", errors.New("机器人不存在")
	}
	// 看看是不是在运行。在运行要就要停止
	if IsRunning(name) {
		msg, err := Stop(name)
		if err != nil {
			return "", errors.New(msg)
		}
	}
	botPath := GetBotPath(name)
	return dao.DeleteBot(name, botPath)
}

func BotYarnInstall(name string) (string, error) {
	if name == "" {
		return "", errors.New("机器人名不能为空")
	}

	if !Exists(name) {
		return "", errors.New("机器人不存在")
	}
	msg, err := Install(name)
	if err != nil {
		return msg, err
	}
	return "", nil
}

func BotYarnAdd(name string, args []string) (string, error) {
	if name == "" {
		return "", errors.New("机器人名不能为空")
	}
	if !Exists(name) {
		return "", errors.New("机器人不存在")
	}
	msg, err := Add(name, args)
	if err != nil {
		return msg, err
	}
	return "", nil
}

func BotYarnRemove(name string, args []string) (string, error) {
	if name == "" {
		return "", errors.New("机器人名不能为空")
	}
	if !Exists(name) {
		return "", errors.New("机器人不存在")
	}
	msg, err := Remove(name, args)
	if err != nil {
		return msg, err
	}
	return "", nil
}
