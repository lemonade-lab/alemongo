package botpackages

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"alemongo/src/models"
	config "alemongo/src/paths"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary 获取应用git所有分支
// @Description 获取应用git所有分支
// @Tags 应用
// @Accept json
// @Produce json
// @Param name query string true "bot名称"
// @Param app_name query string true "应用名称"
// @Param page query int false "页码"
// @Param page_size query int false "每页数量"
// @Success 200 {object} response.ResponseData{data=models.BotPackagesGitBranches} "成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 500 {object} response.ResponseData "内部错误"
// @Router /api/v1/bot/packages/git/branches [get]
func GitBranches(c *gin.Context) {
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

	// 只从本地仓库获取分支信息
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

// @Summary 获取应用git分支提交记录
// @Description 获取应用git分支提交记录
// @Tags 应用
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
// @Router /api/v1/bot/packages/git/commits [get]
func GitCommits(c *gin.Context) {
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
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot name or app name is empty")
		return
	}
	if !config.Exists(botName) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot "+botName+" not exists")
		return
	}
	data, err := GetPackageInfo(botName, appName)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "应用不存在")
		return
	}
	packagePath := data["git"].(map[string]string)["repo"]
	commits, err := logic.PackageGitCommits(packagePath, branchName)
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

// @Summary 从远程获取最新分支信息
// @Description 从远程获取最新分支信息到本地仓库
// @Tags 应用
// @Accept json
// @Produce json
// @Param name query string true "bot名称"
// @Param app_name query string true "应用名称"
// @Success 200 {object} response.ResponseData "成功"
// @Failure 400 {object} response.ResponseData "参数错误"
// @Failure 500 {object} response.ResponseData "内部错误"
// @Router /api/v1/bot/packages/git/fetch [post]
func GitFetch(c *gin.Context) {
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

	err := logic.PackageGitFetch(packagePath)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, fmt.Sprintf("从远程获取分支失败: %v", err))
		return
	}

	// 获取更新后的本地分支列表
	branches, err := logic.PackageGitBranchesLocal(packagePath)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, fmt.Sprintf("获取更新后的本地分支失败: %v", err))
		return
	}

	response.ResponseSuccess(c, gin.H{
		"message":  "成功从远程获取最新分支信息",
		"branches": branches,
	})
}
