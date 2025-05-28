package bot

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/core/alemonjs"
	"alemongo/src/logger"
	"alemongo/src/settings"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
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

	var l = new(zapcore.Level)
	if err := l.UnmarshalText([]byte(settings.Conf.Level)); err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.ErrorLogLevel)
	}

	botLogger, err := logger.GetOrCreateBotLogger(name, *l)
	if err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.ErrorRobotLog)
	}
	botLoggerWriter := logger.NewRobotLoggerWriter(botLogger)
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

	// 获取远程分支和本地分支的提交哈希
	ref, err := repo.Head()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "获取本地分支失败",
			"data": err.Error(),
		})
		return
	}

	localCommit, err := repo.CommitObject(ref.Hash())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "获取本地提交信息失败",
			"data": err.Error(),
		})
		return
	}

	remoteRef, err := repo.Reference(plumbing.NewBranchReferenceName(branchName), true)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "获取远程分支引用失败",
			"data": err.Error(),
		})
		return
	}

	remoteCommit, err := repo.CommitObject(remoteRef.Hash())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "获取远程提交信息失败",
			"data": err.Error(),
		})
		return
	}

	if localCommit.Hash == remoteCommit.Hash {
		botLoggerWriter.RobotLogger.Info("仓库已经是最新状态，无需更新")
		ctx.JSON(http.StatusOK, gin.H{
			"code": http.StatusOK,
			"msg":  "仓库已经是最新",
			"data": nil,
		})
		return
	}

	// 拉取最新代码
	err = worktree.Pull(&git.PullOptions{
		RemoteName:    "origin",
		Auth:          auth, // 使用 SSH 认证
		Progress:      botLoggerWriter.Writer(),
		ReferenceName: plumbing.NewBranchReferenceName(branchName),
		SingleBranch:  true,
	})

	if err != nil {
		if err == git.NoErrAlreadyUpToDate {
			botLoggerWriter.RobotLogger.Info("仓库已经是最新状态，无需更新")
			ctx.JSON(http.StatusOK, gin.H{
				"code": http.StatusOK,
				"msg":  "仓库已经是最新",
				"data": nil,
			})
			return
		}
		botLoggerWriter.RobotLogger.Error("拉取失败: ", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "拉取失败",
			"data": err.Error(),
		})
		return
	}

	botLoggerWriter.RobotLogger.Info("成功拉取最新代码")
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "拉取成功",
		"data": nil,
	})
}
