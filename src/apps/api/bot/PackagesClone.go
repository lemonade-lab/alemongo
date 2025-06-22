package bot

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logger"
	"alemongo/src/logic"
	"alemongo/src/settings"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"net/http"
	"os"
	"os/user"
	"path"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	gitssh "github.com/go-git/go-git/v5/plumbing/transport/ssh"
)

// 获取 SSH 公钥认证
func getSSHAuth() (*gitssh.PublicKeys, error) {
	usr, err := user.Current()
	if err != nil {
		return nil, err
	}
	privateKeyPath := filepath.Join(usr.HomeDir, ".ssh", "id_rsa")
	auth, err := gitssh.NewPublicKeysFromFile("git", privateKeyPath, "")
	if err != nil {
		return nil, err
	}
	return auth, nil
}

// 创建机器人
func PackagesClone(ctx *gin.Context) {
	name := ctx.PostForm("name")
	repoURL := ctx.PostForm("repo_url")
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
	pkgPath := path.Join(botPath, "packages")

	// 确保 packages 文件夹存在
	if _, err := os.Stat(pkgPath); os.IsNotExist(err) {
		if err := os.MkdirAll(pkgPath, os.ModePerm); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"code": http.StatusInternalServerError,
				"msg":  "创建 packages 文件夹失败",
				"data": nil,
			})
			return
		}
	}

	// 从 repoURL 提取仓库名称
	repoName := path.Base(repoURL)
	if repoName == "" || repoName == "." || repoName == "/" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "无效的仓库 URL",
			"data": nil,
		})
		return
	}

	if ext := path.Ext(repoName); ext == ".git" {
		repoName = repoName[:len(repoName)-len(ext)]
	}

	// 确定克隆的目标路径
	clonePath := path.Join(pkgPath, repoName)

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
	if err := l.UnmarshalText([]byte(settings.Conf.Log.Level)); err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.ErrorLogLevel)
	}

	botLogger, err := logger.GetOrCreateBotLogger(name, *l)
	if err != nil {
		response.ResponseError(ctx, http.StatusInternalServerError, response.ErrorRobotLog)
	}
	botLoggerWriter := logger.NewRobotLoggerWriter(botLogger)

	// 克隆仓库并切换到指定分支
	_, err = git.PlainClone(clonePath, false, &git.CloneOptions{
		URL:           repoURL,
		Auth:          auth, // 使用 SSH 认证
		Progress:      botLoggerWriter.Writer(),
		ReferenceName: plumbing.NewBranchReferenceName(branchName),
		SingleBranch:  true,
		Depth:         1,
	})
	if err != nil {
		botLoggerWriter.RobotLogger.Error("克隆失败: ", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code": http.StatusInternalServerError,
			"msg":  "克隆失败",
			"data": nil,
		})
		return
	}

	// 返回成功响应
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "克隆成功",
		"data": nil,
	})
}
