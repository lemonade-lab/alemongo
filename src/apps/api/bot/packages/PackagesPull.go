package botpackages

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logger"
	"alemongo/src/logic"
	"alemongo/src/settings"
	"alemongo/src/utils"
	"net/http"
	"os"
	"path"
	"strings"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/gin-gonic/gin"
	"github.com/go-git/go-git/plumbing/transport"
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
	if !logic.Exists(name) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人不存在",
			"data": nil,
		})
		return
	}

	// 获取路径
	botPath := logic.GetBotPath(name)
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

	var l = new(zapcore.Level)
	if err := l.UnmarshalText([]byte(settings.Conf.Log.Level)); err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.ErrorLogLevel)
	}

	botLogger, err := logger.GetOrCreateBotLogger(name, *l)
	if err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.ErrorRobotLog)
	}
	botLoggerWriter := logger.NewRobotLoggerWriter(botLogger)
	//defer botLoggerWriter.RobotLogger.Close()

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

	// 检查远程仓库的 URL 类型，只有 SSH 源才使用 SSH 认证
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

	// 查找 origin 远程仓库
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

	// 检查是否为 SSH URL (git@开头或ssh://开头)
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
		botLoggerWriter.RobotLogger.Logger.Info("检测到 SSH 源，使用 SSH 认证", zap.String("url", originURL))
	} else {
		botLoggerWriter.RobotLogger.Logger.Info("检测到 HTTPS 源，不使用 SSH 认证", zap.String("url", originURL))
	}

	// 拉取最新代码
	err = worktree.Pull(&git.PullOptions{
		RemoteName:    "origin",
		Auth:          auth, // SSH 源使用 SSH 认证，HTTPS 源为 nil
		Progress:      botLoggerWriter.Writer(),
		ReferenceName: plumbing.NewBranchReferenceName(branchName),
		SingleBranch:  true,
	})

	if err != nil {
		if err == git.NoErrAlreadyUpToDate {
			botLoggerWriter.RobotLogger.Logger.Info("仓库已经是最新状态，无需更新")
			ctx.JSON(http.StatusOK, gin.H{
				"code": http.StatusOK,
				"msg":  "仓库已经是最新",
				"data": nil,
			})
			return
		}
		botLoggerWriter.RobotLogger.Logger.Error("拉取失败: ", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "拉取失败",
			"data": err.Error(),
		})
		return
	}

	botLoggerWriter.RobotLogger.Logger.Info("成功拉取最新代码")
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "拉取成功",
		"data": nil,
	})
}
