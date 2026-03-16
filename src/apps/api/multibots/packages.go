package multibots

import (
	"alemongo/src/dao"
	config "alemongo/src/paths"
	"alemongo/src/utils"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/transport"
)

// getMultiBotPackageInfo 获取单个包的信息（多配置机器人版本）
func getMultiBotPackageInfo(botName, appName string) (map[string]interface{}, error) {
	gitPath := config.GetMultiBotPackagesGitPathByName(botName, appName)
	if _, err := os.Stat(gitPath); os.IsNotExist(err) {
		return nil, err
	}
	pkgPath := config.GetMultiBotPackagesPKGFilePathByName(botName, appName)
	if _, err := os.Stat(pkgPath); os.IsNotExist(err) {
		return nil, err
	}

	pkgData, err := os.ReadFile(pkgPath)
	if err != nil {
		return nil, err
	}

	var pkgJSON map[string]interface{}
	if err := json.Unmarshal(pkgData, &pkgJSON); err != nil {
		return nil, err
	}

	pkgName, ok := pkgJSON["name"].(string)
	if !ok {
		return nil, err
	}

	nodeModulesPath := config.GetMultiBotNodeModulesPathByName(botName, pkgName)
	isExist := 1
	if _, err := os.Stat(nodeModulesPath); os.IsNotExist(err) {
		if fileInfo, err := os.Lstat(nodeModulesPath); err != nil || (fileInfo.Mode()&os.ModeSymlink == 0) {
			isExist = 0
		}
	}

	repo, err := git.PlainOpen(config.GetMultiBotPackagesPathByName(botName, appName))
	if err != nil {
		return nil, err
	}
	remote, err := repo.Remote("origin")
	if err != nil {
		return nil, err
	}
	branch, err := repo.Head()
	if err != nil {
		return nil, err
	}
	commit, err := repo.CommitObject(branch.Hash())
	if err != nil {
		return nil, err
	}

	mdPath := config.GetMultiBotPackagesMdPathByName(botName, appName)
	mdData := ""
	if content, err := os.ReadFile(mdPath); err == nil {
		mdData = string(content)
	}

	return map[string]interface{}{
		"name": appName,
		"git": map[string]string{
			"repo":   remote.Config().URLs[0],
			"branch": branch.Name().Short(),
			"commit": branch.Hash().String(),
			"author": commit.Author.Name,
			"email":  commit.Author.Email,
			"date":   commit.Author.When.String(),
		},
		"pkg":    string(pkgData),
		"md":     mdData,
		"status": isExist,
	}, nil
}

// MultiBotPackagesList 列出多配置机器人的应用包
// POST /api/v1/multibot/packages/list
func MultiBotPackagesList(ctx *gin.Context) {
	botName := ctx.PostForm("name")
	if botName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
			"data": nil,
		})
		return
	}
	if !config.MultiBotExists(botName) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "多配置机器人不存在",
			"data": nil,
		})
		return
	}

	packagesPath := config.GetMultiBotPackagesPath(botName)
	data := []map[string]interface{}{}

	if _, err := os.Stat(packagesPath); os.IsNotExist(err) {
		ctx.JSON(http.StatusOK, gin.H{
			"code": http.StatusOK,
			"msg":  "目录不存在",
			"data": data,
		})
		return
	}

	names, err := utils.GetDirNames(packagesPath)
	if err != nil {
		ctx.JSON(http.StatusOK, gin.H{
			"code": http.StatusOK,
			"msg":  "目录读取失败",
			"data": data,
		})
		return
	}

	for _, name := range names {
		info, err := getMultiBotPackageInfo(botName, name)
		if err == nil && info != nil {
			data = append(data, info)
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "获取成功",
		"data": data,
	})
}

// MultiBotPackagesInfo 获取单个应用包信息
// POST /api/v1/multibot/packages
func MultiBotPackagesInfo(ctx *gin.Context) {
	botName := ctx.PostForm("name")
	appName := ctx.PostForm("app_name")
	if botName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
			"data": nil,
		})
		return
	}
	if !config.MultiBotExists(botName) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "多配置机器人不存在",
			"data": nil,
		})
		return
	}

	packagesPath := config.GetMultiBotPackagesPath(botName)
	if _, err := os.Stat(packagesPath); os.IsNotExist(err) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "应用不存在",
			"data": nil,
		})
		return
	}

	data, err := getMultiBotPackageInfo(botName, appName)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "读取应用配置失败",
			"data": nil,
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "获取成功",
		"data": data,
	})
}

// MultiBotPackagesClone 克隆应用（Git Clone）
// POST /api/v1/multibot/packages/clone
func MultiBotPackagesClone(ctx *gin.Context) {
	name := ctx.PostForm("name")
	repoURL := ctx.PostForm("repo_url")
	branchName := ctx.PostForm("branch_name")
	isForce := ctx.PostForm("force")

	if name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
			"data": nil,
		})
		return
	}
	if !config.MultiBotExists(name) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "多配置机器人不存在",
			"data": nil,
		})
		return
	}

	pkgsPath := config.GetMultiBotPackagesPath(name)
	if _, err := os.Stat(pkgsPath); os.IsNotExist(err) {
		if err := os.MkdirAll(pkgsPath, os.ModePerm); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"code": http.StatusInternalServerError,
				"msg":  "创建 packages 文件夹失败",
				"data": nil,
			})
			return
		}
	}

	repoName := path.Base(repoURL)
	if repoName == "" || repoName == "." || repoName == "/" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "无效的仓库 URL",
			"data": nil,
		})
		return
	}

	appName := strings.TrimSuffix(repoName, ".git")
	appPath := config.GetMultiBotPackagesPathByName(name, appName)

	if _, err := os.Stat(appPath); !os.IsNotExist(err) {
		if isForce == "1" {
			if err := os.RemoveAll(appPath); err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{
					"code": http.StatusInternalServerError,
					"msg":  "删除已存在的应用失败",
					"data": nil,
				})
				return
			}
		} else {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"code": 2001,
				"msg":  "应用已存在",
				"data": nil,
			})
			return
		}
	}

	clonePath := config.GetMultiBotPackagesPathByName(name, appName)

	cloneOpts := &git.CloneOptions{
		URL:          repoURL,
		SingleBranch: true,
		Depth:        1,
	}
	if branchName != "" {
		cloneOpts.ReferenceName = plumbing.NewBranchReferenceName(branchName)
	}

	if strings.Contains(repoURL, "git@") || strings.HasPrefix(repoURL, "ssh://") {
		auth, err := utils.GetSSHAuth()
		if err != nil {
			log.Println(err)
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"code": http.StatusInternalServerError,
				"msg":  "获取 SSH 认证失败",
				"data": err.Error(),
			})
			return
		}
		cloneOpts.Auth = auth
	}

	_, err := git.PlainClone(clonePath, false, cloneOpts)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "克隆失败",
			"data": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "克隆成功",
		"data": nil,
	})
}

// MultiBotPackagesDelete 删除应用包
// DELETE /api/v1/multibot/packages
func MultiBotPackagesDelete(ctx *gin.Context) {
	name := ctx.PostForm("name")
	appName := ctx.PostForm("app_name")

	if name == "" || appName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "name 和 app_name 不能为空",
			"data": nil,
		})
		return
	}
	if !config.MultiBotExists(name) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "多配置机器人不存在",
			"data": nil,
		})
		return
	}

	packagePath := config.GetMultiBotPackagesPathByName(name, appName)
	if _, err := os.Stat(packagePath); os.IsNotExist(err) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "扩展包不存在",
			"data": nil,
		})
		return
	}

	if err := dao.PackageDelete(packagePath); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  err.Error(),
			"data": nil,
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "删除成功",
		"data": nil,
	})
}

// MultiBotPackagesUpdate 更新应用包的 package.json
// PUT /api/v1/multibot/packages/pkg
func MultiBotPackagesUpdate(ctx *gin.Context) {
	name := ctx.PostForm("name")
	appName := ctx.PostForm("app_name")
	content := ctx.PostForm("content")

	if name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
			"data": nil,
		})
		return
	}
	if appName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "应用名不能为空",
			"data": nil,
		})
		return
	}
	if content == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "配置内容不能为空",
			"data": nil,
		})
		return
	}
	if !config.MultiBotExists(name) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "多配置机器人不存在",
			"data": nil,
		})
		return
	}

	pkgPath := config.GetMultiBotPackagesPKGFilePathByName(name, appName)
	if _, err := os.Stat(pkgPath); os.IsNotExist(err) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "应用包不存在",
			"data": nil,
		})
		return
	}

	err := os.WriteFile(pkgPath, []byte(content), 0644)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "保存配置失败",
			"data": nil,
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "配置成功",
		"data": pkgPath,
	})
}

// MultiBotPackagesPull Git 拉取更新
// POST /api/v1/multibot/packages/pull
func MultiBotPackagesPull(ctx *gin.Context) {
	multiBotPull(ctx, false)
}

// MultiBotPackagesForcePull 强制拉取更新
// POST /api/v1/multibot/packages/pull/force
func MultiBotPackagesForcePull(ctx *gin.Context) {
	multiBotPull(ctx, true)
}

func multiBotPull(ctx *gin.Context, isForce bool) {
	name := ctx.PostForm("name")
	repoName := ctx.PostForm("repo_name")
	branchName := ctx.PostForm("branch_name")

	if name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
			"data": nil,
		})
		return
	}
	if branchName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "分支名不能为空",
			"data": nil,
		})
		return
	}
	if !config.MultiBotExists(name) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "多配置机器人不存在",
			"data": nil,
		})
		return
	}

	repoPath := config.GetMultiBotPackagesPathByName(name, repoName)
	if _, err := os.Stat(repoPath); os.IsNotExist(err) {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "仓库不存在",
			"data": nil,
		})
		return
	}

	gitPath := config.GetMultiBotPackagesGitPathByName(name, repoName)
	if _, err := os.Stat(gitPath); os.IsNotExist(err) {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "仓库不存在",
			"data": nil,
		})
		return
	}

	repo, err := git.PlainOpen(repoPath)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "打开仓库失败",
			"data": nil,
		})
		return
	}

	worktree, err := repo.Worktree()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "获取工作区失败",
			"data": err.Error(),
		})
		return
	}

	// 检查远程仓库 URL 类型
	var auth transport.AuthMethod
	remotes, err := repo.Remotes()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "获取远程仓库信息失败",
			"data": err.Error(),
		})
		return
	}

	var originURL string
	for _, remote := range remotes {
		if remote.Config().Name == "origin" {
			if len(remote.Config().URLs) > 0 {
				originURL = remote.Config().URLs[0]
			}
			break
		}
	}

	if originURL == "" {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "未找到 origin 远程仓库",
			"data": nil,
		})
		return
	}

	if strings.HasPrefix(originURL, "git@") || strings.HasPrefix(originURL, "ssh://") {
		auth, err = utils.GetSSHAuth()
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"code": http.StatusInternalServerError,
				"msg":  "获取 SSH 认证失败",
				"data": err.Error(),
			})
			return
		}
	}

	err = worktree.Pull(&git.PullOptions{
		RemoteName:    "origin",
		Auth:          auth,
		ReferenceName: plumbing.NewBranchReferenceName(branchName),
		SingleBranch:  true,
		Force:         isForce,
	})

	if err != nil {
		if err == git.NoErrAlreadyUpToDate {
			ctx.JSON(http.StatusOK, gin.H{
				"code": http.StatusOK,
				"msg":  "仓库已经是最新",
				"data": nil,
			})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "拉取失败",
			"data": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "拉取成功",
		"data": nil,
	})
}
