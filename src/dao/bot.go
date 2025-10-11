package dao

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logger"
	config "alemongo/src/paths"
	"alemongo/src/utils"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"

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

func CreateMultiBot(name, targetPath, resourcesPath string) (string, response.ResCode) {
	if err := os.MkdirAll(targetPath, 0755); err != nil {
		log.Println("创建多配置目录失败: ", err)
		return "", response.RobotCreateFailed
	}

	templatePath := config.GetBotTemplatePath()
	if err := copy.Copy(templatePath, targetPath); err != nil {
		log.Println("复制模板文件失败:", err)
		return "", response.RobotCreateFailed
	}
	if err := os.Mkdir(filepath.Join(targetPath, "configs"), 0755); err != nil {
		log.Println("创建配置文件目录失败")
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
		return fmt.Errorf("打开仓库失败: %w", err)
	}

	// 确保远程存在并 fetch 最新
	auth, _ := utils.GetSSHAuth()
	fetchOpts := &git.FetchOptions{
		RemoteName: "origin",
		Progress: botLogger.Writer(logger.WriterOption{
			DetectLevel: true,
			StripDate:   true,
			StripLevel:  true,
		}),
		Force: true,
	}
	if auth != nil {
		fetchOpts.Auth = auth
	}
	_ = repo.Fetch(fetchOpts)

	worktree, err := repo.Worktree()
	if err != nil {
		return errors.New("获取工作区失败")
	}

	// 优先定位远程分支引用
	remoteRefName := plumbing.NewRemoteReferenceName("origin", branch_name)
	remoteRef, err := repo.Reference(remoteRefName, true)
	if err != nil {
		return fmt.Errorf("未找到远程分支 origin/%s", branch_name)
	}

	// 尝试切换到本地分支，不存在则创建
	localRefName := plumbing.NewBranchReferenceName(branch_name)
	// 检查本地分支是否存在
	_, err = repo.Reference(localRefName, true)
	if err != nil {
		// 创建本地分支并指向远程提交
		if err := repo.Storer.SetReference(plumbing.NewHashReference(localRefName, remoteRef.Hash())); err != nil {
			return fmt.Errorf("创建本地分支失败: %w", err)
		}
	}

	// checkout 到本地分支
	if err := worktree.Checkout(&git.CheckoutOptions{Branch: localRefName, Force: true}); err != nil {
		return fmt.Errorf("切换分支失败: %w", err)
	}

	// 重置到远程最新提交（相当于 pull --hard）
	if err := worktree.Reset(&git.ResetOptions{Commit: remoteRef.Hash(), Mode: git.HardReset}); err != nil {
		return fmt.Errorf("reset失败: %w", err)
	}

	return nil
}
