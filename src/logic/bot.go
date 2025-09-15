package logic

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"alemongo/src/logger"
	"alemongo/src/models"
	"alemongo/src/paths"
	config "alemongo/src/paths"
	"alemongo/src/settings"
	"alemongo/src/utils"
	"errors"
	"fmt"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
	"log"
	"os"
	"path"
	"strings"
	"time"

	"go.uber.org/zap/zapcore"
)

func CreateBot(name string) (string, response.ResCode) {
	// 资源路径
	resourcesPath := paths.GetResourcesPath()
	// 目标路径
	targetPath := paths.GetBotPath(name)
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
	if !paths.Exists(name) {
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

	botPath := paths.GetBotPath(name)
	return dao.DeleteBot(name, botPath)
}

func BotYarnInstall(name string) (string, error) {
	if name == "" {
		return "", errors.New("机器人名不能为空")
	}

	if !paths.Exists(name) {
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
	if !paths.Exists(name) {
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
	if !paths.Exists(name) {
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
	if !paths.Exists(name) {
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
	if !paths.Exists(name) {
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

func PackagesGitCheckout(name, repo_url, isForce, branch_name, commitHash string) error {
	pkgsPath := paths.GetBotPackagesPath(name)
	if _, err := os.Stat(pkgsPath); os.IsNotExist(err) {
		if err := os.MkdirAll(pkgsPath, os.ModePerm); err != nil {
			return err
		}
	}
	repoName := path.Base(repo_url)
	if repoName == "" || repoName == "." || repoName == "/" {
		return fmt.Errorf("无效的仓库 URL")
	}
	appName := strings.TrimSuffix(repoName, ".git")

	// 查看是否存在同名应用
	appPath := config.GetBotPackagesPathByName(name, appName)
	if _, err := os.Stat(appPath); !os.IsNotExist(err) {
		if isForce == "1" {
			// 删除已存在的应用
			if err := os.RemoveAll(appPath); err != nil {
				return fmt.Errorf("删除已存在的应用失败: %w", err)
			}
		} else {
			return fmt.Errorf("应用已存在")
		}
	}
	if ext := path.Ext(repoName); ext == ".git" {
		repoName = repoName[:len(repoName)-len(ext)]
	}

	var l = new(zapcore.Level)
	if err := l.UnmarshalText([]byte(settings.Conf.Log.Level)); err != nil {
		return fmt.Errorf("unable to unmarshal zapcore.Level: %w", err)
	}

	botLogger, err := logger.GetOrCreateBotLogger(name, *l)
	if err != nil {
		return err
	}
	botLoggerWriter := logger.NewRobotLoggerWriter(botLogger)
	//defer botLoggerWriter.RobotLogger.Close()

	// 确定克隆的目标路径
	clonePath := config.GetBotPackagesPathByName(name, repoName)
	var repo *git.Repository
	if strings.Contains(repo_url, "git@") {
		auth, err := utils.GetSSHAuth()
		if err != nil {
			return err
		}
		// 克隆仓库并切换到指定分支
		repo, err = git.PlainClone(clonePath, false, &git.CloneOptions{
			URL:  repo_url,
			Auth: auth, // 使用 SSH 认证
			Progress: botLoggerWriter.Writer(logger.WriterOption{
				DetectLevel: false,
				StripDate:   false,
				StripLevel:  false,
			}),
			ReferenceName: plumbing.NewBranchReferenceName(branch_name),
			SingleBranch:  true,
		})
		if err != nil {
			return err
		}
	} else if strings.Contains(repo_url, "https") {
		repo, err = git.PlainClone(clonePath, false, &git.CloneOptions{
			URL: repo_url,
			Progress: botLoggerWriter.Writer(logger.WriterOption{
				DetectLevel: false,
				StripDate:   false,
				StripLevel:  false,
			}),
			ReferenceName: plumbing.NewBranchReferenceName(branch_name),
			SingleBranch:  true,
		})
		if err != nil {
			return err
		}
	}
	workTree, err := repo.Worktree()
	if err != nil {
		return err
	}
	hash := plumbing.NewHash(commitHash)
	err = workTree.Checkout(&git.CheckoutOptions{
		Hash:  hash,
		Force: true,
	})
	if err != nil {
		return err
	}
	return nil
}

// todo 优化完 PackagesClone 后，直接调用本地的 git 信息获取，速度更快
func PackageGitBranches(repo_url string) ([]string, error) {
	tmpPath, err := os.MkdirTemp("", "git-clone")
	if err != nil {
		return nil, err
	}
	defer os.RemoveAll(tmpPath)

	var repo *git.Repository
	// 克隆仓库
	if strings.Contains(repo_url, "git@") {
		auth, err := utils.GetSSHAuth()
		if err != nil {
			return nil, err
		}
		repo, err = git.PlainClone(tmpPath, false, &git.CloneOptions{
			URL:  repo_url,
			Auth: auth,
		})
		if err != nil {
			return nil, err
		}
	} else if strings.Contains(repo_url, "https") {
		repo, err = git.PlainClone(tmpPath, false, &git.CloneOptions{
			URL: repo_url,
		})
		if err != nil {
			return nil, err
		}
	}
	var branches []string
	refs, err := repo.References()
	if err != nil {
		return nil, err
	}
	err = refs.ForEach(func(ref *plumbing.Reference) error {
		if ref.Name().IsRemote() {
			branches = append(branches, ref.Name().Short())
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return branches, nil
}

func PackageGitCommits(repo_url, branch_name string) ([]models.BotPackagesGitBranchCommitsInfo, error) {
	tmpPath, err := os.MkdirTemp("", "git-clone")
	if err != nil {
		return nil, err
	}
	defer os.RemoveAll(tmpPath)
	// 克隆仓库
	var repo *git.Repository
	if strings.Contains(repo_url, "git@") {
		auth, err := utils.GetSSHAuth()
		if err != nil {
			return nil, err
		}
		repo, err = git.PlainClone(tmpPath, false, &git.CloneOptions{
			URL:           repo_url,
			Auth:          auth,
			ReferenceName: plumbing.NewBranchReferenceName(branch_name),
			SingleBranch:  true,
		})
	} else if strings.Contains(repo_url, "https") {
		repo, err = git.PlainClone(tmpPath, false, &git.CloneOptions{
			URL:           repo_url,
			ReferenceName: plumbing.NewBranchReferenceName(branch_name),
			SingleBranch:  true,
		})
		if err != nil {
			return nil, err
		}
	}
	head, err := repo.Head()
	if err != nil {
		return nil, fmt.Errorf("获取仓库头失败: %w", err)
	}
	commitIter, err := repo.Log(&git.LogOptions{From: head.Hash()})
	if err != nil {
		return nil, fmt.Errorf("获取仓库提交历史失败: %w", err)
	}
	var commits []models.BotPackagesGitBranchCommitsInfo
	err = commitIter.ForEach(func(commit *object.Commit) error {
		commits = append(commits, models.BotPackagesGitBranchCommitsInfo{
			Hash:    commit.Hash.String(),
			Message: commit.Message,
			Author:  commit.Author.Name,
			Date:    commit.Author.When.Format(time.RFC3339),
		})
		return nil
	})
	if err != nil {
		return nil, err
	}
	return commits, nil
}
