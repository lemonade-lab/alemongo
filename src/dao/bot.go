package dao

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/core/alemonjs"
	"alemongo/src/settings"
	"errors"
	"os"
	"path"

	"github.com/otiai10/copy"
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

	// 创建目录 ./resources/{name}
	if err := os.MkdirAll(targetPath, 0755); err != nil {
		return "", response.RobotCreateFailed
	}

	// 模板路径
	templatePath := path.Join(resourcesPath, "template")

	// 复制文件 /resources/template 复制到 /resources/{name}
	if err := copy.Copy(templatePath, targetPath); err != nil {
		return "", response.RobotCreateFailed
	}
	return targetPath, response.CodeSuccess
}

func DeleteBot(name string) (string, error) {
	if name == "" {
		return "", errors.New("机器人名不能为空")
	}
	if !alemonjs.Exists(name) {
		return "", errors.New("机器人不存在")
	}
	// 看看是不是在运行。在运行要就要停止
	if alemonjs.IsRunning(name) {
		msg, err := alemonjs.Stop(name)
		if err != nil {
			return "", errors.New(msg)
		}
	}
	botPath := alemonjs.GetBotPath(name)
	// 删除目录
	if err := os.RemoveAll(botPath); err != nil {
		return "", errors.New("删除机器人失败")
	}
	return botPath, nil
}
