package bot

import (
	"alemongo/src/alemonjs"
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

	// 读取目录下的所有目录名
	names, err := utils.GetDirNames(packagesPath)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "读取目录失败",
			"data": nil,
		})
		return
	}

	data := []map[string]interface{}{}

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
		head, err := repo.Head()
		if err != nil {
			continue
		}
		branchName := head.Name().Short()

		// 读取 README.md
		mdData := ""
		mdPath := path.Join(packagesPath, name, "README.md")
		if content, err := ioutil.ReadFile(mdPath); err == nil {
			mdData = string(content)
		}

		// 添加到结果
		data = append(data, map[string]interface{}{
			"name":   name,
			"branch": branchName,
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
