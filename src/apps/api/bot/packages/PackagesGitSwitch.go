package botpackages

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	config "alemongo/src/paths"
	"github.com/gin-gonic/gin"
	"net/http"
)

// @Summary 切换机器人应用分支
// @Description 切换机器人应用到指定的 Git 分支和提交
// @Tags 机器人应用
// @Accept x-www-form-urlencoded
// @Produce json
// @Param name formData string true "机器人名称"
// @Param app_name formData string true "应用名称"
// @Param branch_name formData string true "分支名称"
// @Param commit_hash formData string true "提交哈希值"
// @Success 200 {object} response.ResponseData{msg=string} "切换成功"
// @Failure 400 {object} response.ResponseData{msg=string} "参数错误或应用不存在"
// @Failure 500 {object} response.ResponseData{msg=string} "切换分支失败"
// @Router /api/v1/packages/switch [post]
func PackagesSwitch(c *gin.Context) {
	botName := c.PostForm("name")
	appName := c.PostForm("app_name")
	branchName := c.PostForm("branch_name")
	commitHash := c.PostForm("commit_hash")
	if botName == "" || appName == "" || branchName == "" || commitHash == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "参数错误")
		return
	}

	if !config.Exists(botName) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "机器人不存在")
		return
	}
	data, err := GetPackageInfo(botName, appName)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "机器人应用不存在")
		return
	}
	// 切换分支
	// todo 暂时直接删除原应用包，待优化完clone操作后，再实现本地直接checkout
	repo_url := data["git"].(map[string]string)["repo"]
	err = logic.PackagesGitCheckout(botName, repo_url, "1", branchName, commitHash)
	if err != nil {
		//fmt.Printf("切换分支到指定commit失败: %v\n", err)
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "切换分支失败")
		return
	}
	response.ResponseSuccess(c, "切换成功")
}
