package logic

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"alemongo/src/logger"
	"alemongo/src/paths"
	config "alemongo/src/paths"
	"alemongo/src/settings"
	"errors"
	"fmt"
	"log"
	"os"

	"go.uber.org/zap/zapcore"
)

func CreateBot(name string) (string, response.ResCode) {
	// 资源路径
	resourcesPath := paths.GetResourcesPath()
	// 目标路径
	targetPath := config.GetBotPath(name)
	// 检查是否存在目录 ./resources/bots/{name}
	if _, err := os.Stat(targetPath); err == nil {
		// 如果存在，返回错误
		log.Println("机器人目录已存在:", targetPath)
		return "", response.RobotAlreadyExist
	}
	return dao.CreateBot(name, targetPath, resourcesPath)
}

func DeleteBot(name string) (string, error) {
	if name == "" {
		return "", errors.New("机器人名不能为空")
	}
	if !config.Exists(name) {
		return "", errors.New("机器人不存在")
	}
	// 看看是不是在运行。在运行要就要停止
	if IsRunning(name) {
		msg, err := Stop(name)
		if err != nil {
			return "", errors.New(msg)
		}
	}

	var l = new(zapcore.Level)
	if err := l.UnmarshalText([]byte(settings.Conf.Log.Level)); err != nil {
		fmt.Printf("unable to unmarshal zapcore.Level: %v\n", err)
	}
	botLogger, _ := logger.GetOrCreateBotLogger(name, *l)

	botLogger.Close()

	logger.DeleteBotLogger(name, *l)

	botPath := config.GetBotPath(name)
	return dao.DeleteBot(name, botPath)
}

func BotYarnInstall(name string) (string, error) {
	if name == "" {
		return "", errors.New("机器人名不能为空")
	}

	if !config.Exists(name) {
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
	if !config.Exists(name) {
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
	if !config.Exists(name) {
		return "", errors.New("机器人不存在")
	}
	msg, err := Remove(name, args)
	if err != nil {
		return msg, err
	}
	return "", nil
}

func PackageDelete(name, app_name string) error {
	if name == "" {
		return errors.New("机器人名不能为空")
	}
	if app_name == "" {
		return errors.New("扩展包名不能为空")
	}
	if !config.Exists(name) {
		return errors.New("机器人不存在")
	}

	packagePath := paths.GetBotPackagesPathByName(name, app_name)
	// 判断git扩展包是否存在
	if _, err := os.Stat(packagePath); os.IsNotExist(err) {
		return errors.New("扩展包不存在")
	}

	return dao.PackageDelete(packagePath)
}

func PackegForcedUpdate(name, repo_name, branch_name string, botLogger *logger.RobotLoggerWriter) error {
	if name == "" {
		return errors.New("机器人名不能为空")
	}
	if repo_name == "" {
		return errors.New("扩展包名不能为空")
	}
	if branch_name == "" {
		return errors.New("分支名不能为空")
	}
	if !config.Exists(name) {
		return errors.New("机器人不存在")
	}

	repoPath := paths.GetBotPackagesPathByName(name, repo_name)

	if _, err := os.Stat(repoPath); os.IsNotExist(err) {
		return errors.New("仓库不存在")
	}
	gitPath := paths.GetBotPackagesGitPathByName(name, repo_name)

	if _, err := os.Stat(gitPath); os.IsNotExist(err) {
		return errors.New("仓库不存在")
	}

	return dao.PackageForcedUpdate(repoPath, branch_name, botLogger)
}
