package bot

import (
	"alemongo/src/core/alemonjs"
	"log"
	"net/http"
	"os"
	"path"

	"github.com/gin-gonic/gin"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
)

// 创建机器人
func PackagesPull(ctx *gin.Context) {
	name := ctx.PostForm("name")
	repo_name := ctx.PostForm("repo_name")
	branchName := ctx.PostForm("branch_name")

	// 检查参数
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
	if !alemonjs.Exists(name) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人不存在",
			"data": nil,
		})
		return
	}

	// 获取路径
	botPath := alemonjs.GetBotPath(name)
	repoPath := path.Join(botPath, "packages", repo_name)

	if _, err := os.Stat(repoPath); os.IsNotExist(err) {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "仓库不存在",
			"data": nil,
		})
		return
	}

	gitPath := path.Join(repoPath, ".git")
	if _, err := os.Stat(gitPath); os.IsNotExist(err) {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "仓库不存在",
			"data": nil,
		})
		return
	}

	// 获取 Git 仓库信息
	repo, err := git.PlainOpen(repoPath)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "打开仓库失败",
			"data": nil,
		})
		return
	}

	auth, err := getSSHAuth()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "获取 SSH 认证失败",
			"data": err.Error(),
		})
		return
	}

	logPath := alemonjs.GetBotLogPath(name)
	// 打开日志文件
	logFile, err := os.OpenFile(logPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "打开日志文件失败",
			"data": nil,
		})
		return
	}
	defer logFile.Close()

	// 设置日志输出到文件
	logger := log.New(logFile, "", log.LstdFlags)

	// 获取工作区
	worktree, err := repo.Worktree()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "获取工作区失败",
			"data": err.Error(),
		})
		return
	}

	// 拉取最新代码
	err = worktree.Pull(&git.PullOptions{
		RemoteName:    "origin",
		Auth:          auth,
		Progress:      logger.Writer(),
		ReferenceName: plumbing.NewBranchReferenceName(branchName),
		SingleBranch:  true,
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
