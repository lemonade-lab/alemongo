package logic

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
	"alemongo/src/logger"
	"alemongo/src/models"
	config "alemongo/src/paths"
	"alemongo/src/settings"
	"alemongo/src/utils"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"path"
	"strings"
	"time"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"

	"go.uber.org/zap/zapcore"
)

func CreateBot(name string) (string, response.ResCode) {
	// 资源路径
	resourcesPath := config.GetResourcesPath()
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

func CreateMultiBot(name string) (string, response.ResCode) {
	resourcesPath := config.GetResourcesPath()
	targetPath := config.GetMultiBotPath(name)
	if _, err := os.Stat(targetPath); err == nil {
		log.Println("多配置机器人目录已存在: ", targetPath)
		return "", response.RobotAlreadyExist
	}
	return dao.CreateMultiBot(name, targetPath, resourcesPath)
}

// CopyDir 复制目录下的所有文件到目标目录
func CopyDir(src, dest string) error {
	err := clearFloder(dest)
	if err != nil {
		return fmt.Errorf("clearFloder: %w", err)
	}
	err = copyFolder(src, dest)
	if err != nil {
		return fmt.Errorf("copyFolder: %w", err)
	}
	return nil
}

func copyFolder(src, dest string) error {
	err := os.MkdirAll(dest, os.ModePerm)
	if err != nil {
		return err
	}
	entries, err := os.ReadDir(src)
	if err != nil {
		return fmt.Errorf("read dir %s failed: %w", src, err)
	}
	for _, entry := range entries {
		sourcePath := path.Join(src, entry.Name())
		targetPath := path.Join(dest, entry.Name())
		if entry.Name() == "logs" || entry.Name() == "log" {
			continue
		}
		if entry.IsDir() {
			err = copyFolder(sourcePath, targetPath)
			if err != nil {
				return fmt.Errorf("copy folder failed: %w", err)
			}
		} else {
			err = CopyFile(sourcePath, targetPath)
			if err != nil {
				return fmt.Errorf("copy file failed: %w", err)
			}
		}
	}
	return nil
}

func CopyFile(src, dest string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return fmt.Errorf("open source file: %w", err)
	}
	defer sourceFile.Close()
	destFile, err := os.Create(dest)
	if err != nil {
		return fmt.Errorf("create file %s failed: %w", dest, err)
	}
	defer destFile.Close()
	_, err = io.Copy(destFile, sourceFile)
	if err != nil {
		return fmt.Errorf("copy file %s to %s failed: %w", src, dest, err)
	}

	srcInfo, err := os.Stat(src)
	if err != nil {
		return fmt.Errorf("stat file %s failed: %w", src, err)
	}
	err = os.Chmod(dest, srcInfo.Mode())
	if err != nil {
		return fmt.Errorf("chmod fail: %w", err)
	}
	return destFile.Sync()
}

func clearFloder(targetPath string) error {
	entries, err := os.ReadDir(targetPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return fmt.Errorf("read dir fail: %w", err)
	}
	for _, entry := range entries {
		entryPath := path.Join(targetPath, entry.Name())
		if entry.Name() == "logs" || entry.Name() == "log" {
			continue
		}
		err := os.RemoveAll(entryPath)
		if err != nil {
			return fmt.Errorf("删除文件失败: %w", err)
		}
	}
	return nil
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

	packagePath := config.GetBotPackagesPathByName(name, app_name)
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

	repoPath := config.GetBotPackagesPathByName(name, repo_name)

	if _, err := os.Stat(repoPath); os.IsNotExist(err) {
		return errors.New("仓库不存在")
	}
	gitPath := config.GetBotPackagesGitPathByName(name, repo_name)

	if _, err := os.Stat(gitPath); os.IsNotExist(err) {
		return errors.New("仓库不存在")
	}

	return dao.PackageForcedUpdate(repoPath, branch_name, botLogger)
}

func PackagesGitCheckout(name, repo_url, isForce, branch_name, commitHash string) error {
	pkgsPath := config.GetBotPackagesPath(name)
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
	branch_name = strings.TrimPrefix(branch_name, "origin/")
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
			return nil, fmt.Errorf("克隆SSH仓库失败: %w", err)
		}
	} else if strings.Contains(repo_url, "https") {
		repo, err = git.PlainClone(tmpPath, false, &git.CloneOptions{
			URL: repo_url,
		})
		if err != nil {
			return nil, fmt.Errorf("克隆HTTPS仓库失败: %w", err)
		}
	} else {
		return nil, fmt.Errorf("不支持的仓库URL格式: %s", repo_url)
	}

	if repo == nil {
		return nil, fmt.Errorf("仓库克隆失败")
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
	branch_name = strings.TrimPrefix(branch_name, "origin/")
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
		if err != nil {
			return nil, fmt.Errorf("克隆SSH仓库失败: %w", err)
		}
	} else if strings.Contains(repo_url, "https") {
		repo, err = git.PlainClone(tmpPath, false, &git.CloneOptions{
			URL:           repo_url,
			ReferenceName: plumbing.NewBranchReferenceName(branch_name),
			SingleBranch:  true,
		})
		if err != nil {
			return nil, fmt.Errorf("克隆HTTPS仓库失败: %w", err)
		}
	} else {
		return nil, fmt.Errorf("不支持的仓库URL格式: %s", repo_url)
	}

	if repo == nil {
		return nil, fmt.Errorf("仓库克隆失败")
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
