package bot

import (
	"alemongo/src/core/alemonjs"
	"alemongo/src/utils"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"path"

	"github.com/gin-gonic/gin"

	"github.com/go-git/go-git/v5"
)

func PackagesList(ctx *gin.Context) {
	name := ctx.PostForm("name")
	if name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
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

	// 读取该机器人的 packages 目录
	botPath := alemonjs.GetBotPath(name)
	packagesPath := path.Join(botPath, "packages")

	data := []map[string]interface{}{}

	// 检查目录是否存在
	if _, err := os.Stat(packagesPath); os.IsNotExist(err) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusOK,
			"msg":  "目录不存在",
			"data": data,
		})
		return
	}

	// 读取目录下的所有目录名
	names, err := utils.GetDirNames(packagesPath)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusOK,
			"msg":  "目录读取失败",
			"data": data,
		})
		return
	}

	for _, name := range names {
		gitPath := path.Join(packagesPath, name, ".git")
		if _, err := os.Stat(gitPath); os.IsNotExist(err) {
			continue
		}

		pkgPath := path.Join(packagesPath, name, "package.json")
		if _, err := os.Stat(pkgPath); os.IsNotExist(err) {
			continue
		}

		// 读取 package.json
		pkgData, err := ioutil.ReadFile(pkgPath)
		if err != nil {
			continue
		}

		// 解析 JSON
		var result map[string]interface{}
		err = json.Unmarshal(pkgData, &result)
		if err != nil {
			continue
		}

		// 获取包名
		pkgName, ok := result["name"].(string)
		if !ok {
			continue
		}

		// 检查是否被模块化
		myPath := path.Join(alemonjs.GetBotPath(name), "node_modules", pkgName)
		isExist := 1
		// 不存在
		if _, err := os.Stat(myPath); os.IsNotExist(err) {
			// 也不是软链接
			if fileInfo, err := os.Lstat(myPath); err != nil || (fileInfo.Mode()&os.ModeSymlink == 0) {
				isExist = 0
			}
		}

		// 获取 Git 仓库信息
		repo, err := git.PlainOpen(gitPath)
		if err != nil {
			continue
		}
		// 获取当前仓库源
		remote, err := repo.Remote("origin")
		if err != nil {
			continue
		}
		// 读取当前分支
		branch, err := repo.Head()
		if err != nil {
			continue
		}
		// commit
		commit, err := repo.CommitObject(branch.Hash())
		if err != nil {
			continue
		}

		// 读取 README.md
		mdData := ""
		mdPath := path.Join(packagesPath, name, "README.md")
		if content, err := ioutil.ReadFile(mdPath); err == nil {
			mdData = string(content)
		}

		// 添加到结果
		data = append(data, map[string]interface{}{
			"name": name,
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
		})
	}

	// 返回数据
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "获取成功",
		"data": data,
	})
}
