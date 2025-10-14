package botpackages

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"alemongo/src/models"
	config "alemongo/src/paths"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// @Summary 获取应用git本地分支列表（快速版本）
// @Description 从本地仓库获取分支列表，不访问远程
// @Tags 机器人应用
// @Accept json
// @Produce json
// @Param name query string true "bot名称"
// @Param app_name query string true "应用名称"
// @Param page query int false "页码"
// @Param page_size query int false "每页数量"
// @Success 200 {object} response.ResponseData{data=models.BotPackagesGitBranches} "成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 500 {object} response.ResponseData "内部错误"
// @Router /api/v1/bot/packages/git/branches/local [get]
func GitBranchesLocal(c *gin.Context) {
	botName := c.Query("name")
	appName := c.Query("app_name")
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "10")
	page, err := strconv.Atoi(pageStr)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "page is not a number")
		return
	}
	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "page_size is not a number")
		return
	}
	if botName == "" || appName == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot name or app name is empty")
		return
	}
	if !config.Exists(botName) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot "+botName+" not exists")
		return
	}

	// 检查应用是否存在
	packagePath := config.GetBotPackagesPathByName(botName, appName)
	if _, err := os.Stat(packagePath); os.IsNotExist(err) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "应用不存在")
		return
	}

	// 从本地仓库获取分支信息
	branches, err := logic.PackageGitBranchesLocal(packagePath)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, fmt.Sprintf("获取本地git分支失败: %v", err))
		return
	}
	total := len(branches)
	totalPages := (total + pageSize - 1) / pageSize
	if page > totalPages && total > 0 {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "page is out of range")
		return
	}
	if total == 0 && page > 1 {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "page is out of range")
		return
	}
	startIdx := (page - 1) * pageSize
	endIdx := startIdx + pageSize
	// 防止越界
	if startIdx > total {
		branches = []string{}
	} else {
		if endIdx > total {
			endIdx = total
		}
		branches = branches[startIdx:endIdx]
	}
	branchesInfo := models.BotPackagesGitBranches{
		Branches:  branches,
		Total:     total,
		Page:      page,
		PageSize:  pageSize,
		TotalPage: totalPages,
	}
	response.ResponseSuccess(c, branchesInfo)
}

// @Summary 获取应用git本地提交记录（快速版本）
// @Description 从本地仓库获取指定分支的提交记录
// @Tags 机器人应用
// @Accept json
// @Produce json
// @Param name query string true "bot名称"
// @Param app_name query string true "应用名称"
// @Param branch_name query string true "分支名称"
// @Param page query int false "页码"
// @Param page_size query int false "每页数量"
// @Success 200 {object} response.ResponseData{data=models.BotPackagesGitCommits} "成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 500 {object} response.ResponseData "内部错误"
// @Router /api/v1/bot/packages/git/commits/local [get]
func GitCommitsLocal(c *gin.Context) {
	botName := c.Query("name")
	appName := c.Query("app_name")
	branchName := c.Query("branch_name")
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "10")
	page, err := strconv.Atoi(pageStr)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "page is not a number")
		return
	}
	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "page_size is not a number")
		return
	}
	if botName == "" || appName == "" || branchName == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot name, app name or branch name is empty")
		return
	}
	if !config.Exists(botName) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot "+botName+" not exists")
		return
	}

	// 检查应用是否存在
	packagePath := config.GetBotPackagesPathByName(botName, appName)
	if _, err := os.Stat(packagePath); os.IsNotExist(err) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "应用不存在")
		return
	}

	// 从本地仓库获取提交记录
	commits, err := logic.PackageGitCommitsLocal(packagePath, branchName)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, fmt.Sprintf("获取git提交记录失败: %v", err))
		return
	}
	total := len(commits)
	totalPages := (total + pageSize - 1) / pageSize
	if page > totalPages && total > 0 {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "page is out of range")
		return
	}
	if total == 0 && page > 1 {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "page is out of range")
		return
	}
	startIdx := (page - 1) * pageSize
	endIdx := startIdx + pageSize
	if startIdx > total {
		commits = []models.BotPackagesGitBranchCommitsInfo{}
	} else {
		if endIdx > total {
			endIdx = total
		}
		commits = commits[startIdx:endIdx]
	}
	commitsInfo := models.BotPackagesGitCommits{
		Commits:   commits,
		Total:     total,
		Page:      page,
		PageSize:  pageSize,
		TotalPage: totalPages,
	}
	response.ResponseSuccess(c, commitsInfo)
}

// @Summary 获取Git仓库状态
// @Description 获取当前分支、是否有未提交的修改等状态信息
// @Tags 机器人应用
// @Accept json
// @Produce json
// @Param name query string true "bot名称"
// @Param app_name query string true "应用名称"
// @Success 200 {object} response.ResponseData{data=models.BotPackagesGitStatus} "成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 500 {object} response.ResponseData "内部错误"
// @Router /api/v1/bot/packages/git/status [get]
func GitStatus(c *gin.Context) {
	botName := c.Query("name")
	appName := c.Query("app_name")

	if botName == "" || appName == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot name or app name is empty")
		return
	}
	if !config.Exists(botName) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot "+botName+" not exists")
		return
	}

	// 检查应用是否存在
	packagePath := config.GetBotPackagesPathByName(botName, appName)
	if _, err := os.Stat(packagePath); os.IsNotExist(err) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "应用不存在")
		return
	}

	// 获取当前分支
	cmd := exec.Command("git", "-C", packagePath, "rev-parse", "--abbrev-ref", "HEAD")
	branchOutput, err := cmd.Output()
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusInternalServerError, http.StatusInternalServerError, fmt.Sprintf("获取当前分支失败: %v", err))
		return
	}
	currentBranch := strings.TrimSpace(string(branchOutput))

	// 获取工作区状态
	cmd = exec.Command("git", "-C", packagePath, "status", "--porcelain")
	statusOutput, err := cmd.Output()
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusInternalServerError, http.StatusInternalServerError, fmt.Sprintf("获取工作区状态失败: %v", err))
		return
	}

	statusLines := strings.Split(strings.TrimSpace(string(statusOutput)), "\n")
	isClean := len(statusOutput) == 0 || (len(statusLines) == 1 && statusLines[0] == "")
	modifiedFiles := 0
	var files []map[string]string

	if !isClean {
		for _, line := range statusLines {
			if line == "" {
				continue
			}
			modifiedFiles++
			// 格式: XY filename
			if len(line) >= 3 {
				status := strings.TrimSpace(line[:2])
				file := strings.TrimSpace(line[3:])
				files = append(files, map[string]string{
					"file":   file,
					"status": status,
				})
			}
		}
	}

	gitStatus := models.BotPackagesGitStatus{
		CurrentBranch: currentBranch,
		IsClean:       isClean,
		ModifiedFiles: modifiedFiles,
		Files:         files,
	}

	response.ResponseSuccess(c, gitStatus)
}

// @Summary 切换本地分支
// @Description 使用git checkout切换到本地已存在的分支
// @Tags 机器人应用
// @Accept x-www-form-urlencoded
// @Produce json
// @Param name formData string true "bot名称"
// @Param app_name formData string true "应用名称"
// @Param branch_name formData string true "分支名称"
// @Param force formData boolean false "是否强制切换（丢弃本地修改）"
// @Success 200 {object} response.ResponseData "切换成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 500 {object} response.ResponseData "切换失败"
// @Router /api/v1/bot/packages/git/checkout [post]
func GitCheckout(c *gin.Context) {
	botName := c.PostForm("name")
	appName := c.PostForm("app_name")
	branchName := c.PostForm("branch_name")
	forceStr := c.PostForm("force")
	force := forceStr == "true" || forceStr == "1"

	if botName == "" || appName == "" || branchName == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot name, app name or branch name is empty")
		return
	}
	if !config.Exists(botName) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot "+botName+" not exists")
		return
	}

	// 检查应用是否存在
	packagePath := config.GetBotPackagesPathByName(botName, appName)
	if _, err := os.Stat(packagePath); os.IsNotExist(err) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "应用不存在")
		return
	}

	// 检查工作区是否有未提交的修改
	if !force {
		cmd := exec.Command("git", "-C", packagePath, "status", "--porcelain")
		statusOutput, err := cmd.Output()
		if err != nil {
			response.ResponseErrorWithMsg(c, http.StatusInternalServerError, http.StatusInternalServerError, fmt.Sprintf("获取工作区状态失败: %v", err))
			return
		}
		if len(statusOutput) > 0 {
			response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "工作区包含未暂存的更改，请使用force参数强制切换或先提交/放弃修改")
			return
		}
	}

	// 执行git checkout
	args := []string{"-C", packagePath, "checkout"}
	if force {
		args = append(args, "-f")
	}
	args = append(args, branchName)

	cmd := exec.Command("git", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusInternalServerError, http.StatusInternalServerError, fmt.Sprintf("切换分支失败: %v, output: %s", err, string(output)))
		return
	}

	response.ResponseSuccess(c, gin.H{
		"message": fmt.Sprintf("成功切换到分支: %s", branchName),
	})
}

// @Summary 放弃工作区修改
// @Description 放弃所有未提交的修改,恢复到最后一次提交的状态
// @Tags 机器人应用
// @Accept x-www-form-urlencoded
// @Produce json
// @Param name formData string true "bot名称"
// @Param app_name formData string true "应用名称"
// @Success 200 {object} response.ResponseData "放弃修改成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 500 {object} response.ResponseData "操作失败"
// @Router /api/v1/bot/packages/git/discard [post]
func GitDiscardChanges(c *gin.Context) {
	botName := c.PostForm("name")
	appName := c.PostForm("app_name")

	if botName == "" || appName == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot name or app name is empty")
		return
	}
	if !config.Exists(botName) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot "+botName+" not exists")
		return
	}

	// 检查应用是否存在
	packagePath := config.GetBotPackagesPathByName(botName, appName)
	if _, err := os.Stat(packagePath); os.IsNotExist(err) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "应用不存在")
		return
	}

	// 放弃所有修改：git reset --hard HEAD
	cmd := exec.Command("git", "-C", packagePath, "reset", "--hard", "HEAD")
	output, err := cmd.CombinedOutput()
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusInternalServerError, http.StatusInternalServerError, fmt.Sprintf("放弃修改失败: %v, output: %s", err, string(output)))
		return
	}

	// 清理未跟踪的文件：git clean -fd
	cmd = exec.Command("git", "-C", packagePath, "clean", "-fd")
	output, err = cmd.CombinedOutput()
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusInternalServerError, http.StatusInternalServerError, fmt.Sprintf("清理未跟踪文件失败: %v, output: %s", err, string(output)))
		return
	}

	// 再次检查状态
	cmd = exec.Command("git", "-C", packagePath, "status", "--porcelain")
	statusOutput, err := cmd.Output()
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusInternalServerError, http.StatusInternalServerError, fmt.Sprintf("获取工作区状态失败: %v", err))
		return
	}

	if len(statusOutput) > 0 {
		response.ResponseErrorWithMsg(c, http.StatusInternalServerError, http.StatusInternalServerError, "放弃修改后仍有修改，可能需要手动处理")
		return
	}

	response.ResponseSuccess(c, gin.H{
		"message": "已成功放弃所有修改",
	})
}

// @Summary Git仓库清理
// @Description 清理损坏的Git对象和引用,尝试修复仓库
// @Tags 机器人应用
// @Accept x-www-form-urlencoded
// @Produce json
// @Param name formData string true "bot名称"
// @Param app_name formData string true "应用名称"
// @Success 200 {object} response.ResponseData "清理成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 500 {object} response.ResponseData "清理失败"
// @Router /api/v1/bot/packages/git/cleanup [post]
func GitCleanup(c *gin.Context) {
	botName := c.PostForm("name")
	appName := c.PostForm("app_name")

	if botName == "" || appName == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot name or app name is empty")
		return
	}
	if !config.Exists(botName) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot "+botName+" not exists")
		return
	}

	// 检查应用是否存在
	packagePath := config.GetBotPackagesPathByName(botName, appName)
	if _, err := os.Stat(packagePath); os.IsNotExist(err) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "应用不存在")
		return
	}

	// 执行git fsck
	cmd := exec.Command("git", "-C", packagePath, "fsck", "--full")
	_, _ = cmd.CombinedOutput() // 忽略错误，继续清理

	// 执行git gc --prune=now
	cmd = exec.Command("git", "-C", packagePath, "gc", "--prune=now", "--aggressive")
	output, err := cmd.CombinedOutput()
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusInternalServerError, http.StatusInternalServerError, fmt.Sprintf("清理仓库失败: %v, output: %s", err, string(output)))
		return
	}

	response.ResponseSuccess(c, gin.H{
		"message": "仓库清理完成",
	})
}

// @Summary Git仓库诊断
// @Description 诊断Git仓库的健康状况
// @Tags 机器人应用
// @Accept json
// @Produce json
// @Param name query string true "bot名称"
// @Param app_name query string true "应用名称"
// @Success 200 {object} response.ResponseData "诊断成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 500 {object} response.ResponseData "诊断失败"
// @Router /api/v1/bot/packages/git/diagnose [get]
func GitDiagnose(c *gin.Context) {
	botName := c.Query("name")
	appName := c.Query("app_name")

	if botName == "" || appName == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot name or app name is empty")
		return
	}
	if !config.Exists(botName) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot "+botName+" not exists")
		return
	}

	// 检查应用是否存在
	packagePath := config.GetBotPackagesPathByName(botName, appName)
	if _, err := os.Stat(packagePath); os.IsNotExist(err) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "应用不存在")
		return
	}

	// 执行git fsck
	cmd := exec.Command("git", "-C", packagePath, "fsck", "--full")
	output, err := cmd.CombinedOutput()

	result := gin.H{
		"message": "仓库诊断完成",
		"healthy": err == nil,
		"output":  string(output),
	}

	if err != nil {
		result["error"] = err.Error()
	}

	response.ResponseSuccess(c, result)
}

// @Summary 取消浅克隆限制
// @Description 将浅克隆的仓库转换为完整仓库,获取所有历史记录
// @Tags 机器人应用
// @Accept x-www-form-urlencoded
// @Produce json
// @Param name formData string true "bot名称"
// @Param app_name formData string true "应用名称"
// @Success 200 {object} response.ResponseData "取消浅克隆成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 500 {object} response.ResponseData "操作失败"
// @Router /api/v1/bot/packages/git/unshallow [post]
func GitUnshallow(c *gin.Context) {
	botName := c.PostForm("name")
	appName := c.PostForm("app_name")

	if botName == "" || appName == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot name or app name is empty")
		return
	}
	if !config.Exists(botName) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot "+botName+" not exists")
		return
	}

	// 检查应用是否存在
	packagePath := config.GetBotPackagesPathByName(botName, appName)
	if _, err := os.Stat(packagePath); os.IsNotExist(err) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "应用不存在")
		return
	}

	// 检查是否为浅克隆
	shallowFile := packagePath + "/.git/shallow"
	if _, err := os.Stat(shallowFile); os.IsNotExist(err) {
		response.ResponseSuccess(c, gin.H{
			"message": "仓库不是浅克隆，无需操作",
		})
		return
	}

	// 执行git fetch --unshallow
	cmd := exec.Command("git", "-C", packagePath, "fetch", "--unshallow")
	output, err := cmd.CombinedOutput()
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusInternalServerError, http.StatusInternalServerError, fmt.Sprintf("取消浅克隆失败: %v, output: %s", err, string(output)))
		return
	}

	response.ResponseSuccess(c, gin.H{
		"message": "成功取消浅克隆限制，已获取完整历史记录",
	})
}
