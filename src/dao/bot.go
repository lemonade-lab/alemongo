package dao

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logger"
	config "alemongo/src/paths"
	"alemongo/src/utils"
	"errors"
	"log"
	"os"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"

	"github.com/otiai10/copy"
)

func CreateBot(name, targetPath, resourcesPath string) (string, response.ResCode) {
	// 创建目录 ./resources/bots/{name}
	if err := os.MkdirAll(targetPath, 0755); err != nil {
		log.Println("创建机器人目录失败:", err)
		return "", response.RobotCreateFailed
	}
	// 模板路径
	templatePath := config.GetBotTemplatePath()
	// 复制文件 /resources/template 复制到 /resources/bots/{name}
	if err := copy.Copy(templatePath, targetPath); err != nil {
		log.Println("复制模板文件失败:", err)
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

func PackageDelete(packagePath string) error {
	if err := os.RemoveAll(packagePath); err != nil {
		return errors.New("删除扩展包失败")
	}
	return nil
}

func PackageForcedUpdate(repoPath, branch_name string, botLogger *logger.RobotLoggerWriter) error {
	repo, err := git.PlainOpen(repoPath)
	if err != nil {
		return errors.New("打开仓库失败")
	}
	auth, err := utils.GetSSHAuth()
	if err != nil {
		return errors.New("获取SSH认证失败")
	}

	err = repo.Fetch(&git.FetchOptions{
		RemoteName: "origin",
		Auth:       auth,
		Progress: botLogger.Writer(logger.WriterOption{
			DetectLevel: true,
			StripDate:   true,
			StripLevel:  true,
		}),
		Force: true,
	})
	if err != nil && err != git.NoErrAlreadyUpToDate {
		log.Println(err)
		return errors.New("Fetch失败")
	}

	worktree, err := repo.Worktree()
	if err != nil {
		return errors.New("获取工作区失败")
	}
	refName := plumbing.NewRemoteReferenceName("origin", branch_name)
	ref, err := repo.Reference(refName, true)
	if err != nil {
		return errors.New("未找到远程分支")
	}

	err = worktree.Reset(&git.ResetOptions{
		Commit: ref.Hash(),
		Mode:   git.HardReset,
	})

	if err != nil {
		return errors.New("reset失败")
	}
	return nil
}
