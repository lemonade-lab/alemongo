package botpackages

import (
	config "alemongo/src/paths"
	"alemongo/src/utils"
	"encoding/json"
	"net/http"
	"os"
	"path"

	"github.com/gin-gonic/gin"

	"github.com/go-git/go-git/v5"
)

// 获取单个包的信息
func GetPackageInfo(packagesPath, botName, appName string) (map[string]interface{}, error) {
	gitPath := config.GetBotPackagesGitPathByName(botName, appName)
	// 检查 .git 和 package.json 是否存在
	if _, err := os.Stat(gitPath); os.IsNotExist(err) {
		return nil, err
	}
	pkgPath := config.GetBotPackagesPKGFilePathByName(botName, appName)
	if _, err := os.Stat(pkgPath); os.IsNotExist(err) {
		return nil, err
	}

	// 读取 package.json
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

	// 检查 node_modules 下是否存在
	nodeModulesPath := config.GetBotNodeModulesPathByName(botName, pkgName)
	isExist := 1
	if _, err := os.Stat(nodeModulesPath); os.IsNotExist(err) {
		if fileInfo, err := os.Lstat(nodeModulesPath); err != nil || (fileInfo.Mode()&os.ModeSymlink == 0) {
			isExist = 0
		}
	}

	// 获取 Git 信息
	repo, err := git.PlainOpen(gitPath)
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

	// 读取 README.md
	mdPath := path.Join(packagesPath, appName, "README.md")
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

func PackagesList(ctx *gin.Context) {
	botName := ctx.PostForm("name")
	if botName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
			"data": nil,
		})
		return
	}
	if !config.Exists(botName) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人不存在",
			"data": nil,
		})
		return
	}

	packagesPath := config.GetBotPackagesPath(botName)
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
		info, err := GetPackageInfo(packagesPath, botName, name)
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
