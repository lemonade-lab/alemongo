package dao

import (
	"alemongo/src/apps/api/response"
	"errors"
	"os"
	"path"

	"github.com/otiai10/copy"
)

func CreateBot(name, targetPath, resourcesPath string) (string, response.ResCode) {

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

func DeleteBot(name, botPath string) (string, error) {
	// 删除目录
	if err := os.RemoveAll(botPath); err != nil {
		return "", errors.New("删除机器人失败")
	}
	return botPath, nil
}
