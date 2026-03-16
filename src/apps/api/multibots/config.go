package multibots

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/paths"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

// AddBotConfig 添加多配置机器人配置
func AddBotConfig(c *gin.Context) {
	botName := c.PostForm("bot_name")
	name := c.PostForm("name")
	if name == "" {
		response.ResponseError(c, http.StatusBadRequest, response.ConfigNameIsEmpty)
		return
	}
	if botName == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot_name is empty")
		return
	}
	content := c.PostForm("content")
	multiBotConfigPath := paths.GetMultiBotConfigPath(botName)
	curPath := filepath.Join(multiBotConfigPath, fmt.Sprintf("%s.yaml", name))
	err := os.WriteFile(curPath, []byte(content), 0644)
	if err != nil {
		response.ResponseError(c, http.StatusBadRequest, response.CreateConfigFailed)
		return
	}
	response.ResponseSuccess(c, curPath)
}

// ConfigsList 获取多配置机器人的配置文件列表
func ConfigsList(c *gin.Context) {
	botName := c.Query("name")
	if botName == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "name 不能为空")
		return
	}
	if !paths.MultiBotExists(botName) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "多配置机器人不存在")
		return
	}
	configsPath := paths.GetMultiBotConfigPath(botName)
	entries, err := os.ReadDir(configsPath)
	if err != nil {
		response.ResponseSuccess(c, []string{})
		return
	}
	var configs []string
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		ext := filepath.Ext(entry.Name())
		if ext != ".yaml" && ext != ".yml" {
			continue
		}
		configs = append(configs, strings.TrimSuffix(entry.Name(), ext))
	}
	response.ResponseSuccess(c, configs)
}

// ConfigRead 读取多配置机器人的某个配置文件内容
func ConfigRead(c *gin.Context) {
	botName := c.PostForm("bot_name")
	name := c.PostForm("name")
	if botName == "" || name == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot_name 和 name 不能为空")
		return
	}
	if !paths.MultiBotExists(botName) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "多配置机器人不存在")
		return
	}
	configsPath := paths.GetMultiBotConfigPath(botName)
	// 尝试 .yaml 和 .yml
	var configFilePath string
	for _, ext := range []string{".yaml", ".yml"} {
		fp := filepath.Join(configsPath, name+ext)
		if _, err := os.Stat(fp); err == nil {
			configFilePath = fp
			break
		}
	}
	if configFilePath == "" {
		response.ResponseErrorWithMsg(c, http.StatusNotFound, http.StatusNotFound, "配置文件不存在")
		return
	}
	data, err := os.ReadFile(configFilePath)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusInternalServerError, http.StatusInternalServerError, "读取配置失败")
		return
	}
	response.ResponseSuccess(c, string(data))
}

// ConfigUpdate 更新多配置机器人的某个配置文件内容
func ConfigUpdate(c *gin.Context) {
	botName := c.PostForm("bot_name")
	name := c.PostForm("name")
	content := c.PostForm("content")
	if botName == "" || name == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot_name 和 name 不能为空")
		return
	}
	if !paths.MultiBotExists(botName) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "多配置机器人不存在")
		return
	}
	configsPath := paths.GetMultiBotConfigPath(botName)
	// 优先查找已有文件
	var configFilePath string
	for _, ext := range []string{".yaml", ".yml"} {
		fp := filepath.Join(configsPath, name+ext)
		if _, err := os.Stat(fp); err == nil {
			configFilePath = fp
			break
		}
	}
	if configFilePath == "" {
		// 不存在则新建 .yaml
		configFilePath = filepath.Join(configsPath, name+".yaml")
	}
	if err := os.WriteFile(configFilePath, []byte(content), 0644); err != nil {
		response.ResponseErrorWithMsg(c, http.StatusInternalServerError, http.StatusInternalServerError, "写入配置失败")
		return
	}
	response.ResponseSuccess(c, nil)
}

// ConfigDelete 删除多配置机器人的某个配置文件
func ConfigDelete(c *gin.Context) {
	botName := c.PostForm("bot_name")
	name := c.PostForm("name")
	if botName == "" || name == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot_name 和 name 不能为空")
		return
	}
	if !paths.MultiBotExists(botName) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "多配置机器人不存在")
		return
	}
	configsPath := paths.GetMultiBotConfigPath(botName)
	var configFilePath string
	for _, ext := range []string{".yaml", ".yml"} {
		fp := filepath.Join(configsPath, name+ext)
		if _, err := os.Stat(fp); err == nil {
			configFilePath = fp
			break
		}
	}
	if configFilePath == "" {
		response.ResponseErrorWithMsg(c, http.StatusNotFound, http.StatusNotFound, "配置文件不存在")
		return
	}
	if err := os.Remove(configFilePath); err != nil {
		response.ResponseErrorWithMsg(c, http.StatusInternalServerError, http.StatusInternalServerError, "删除配置失败")
		return
	}
	response.ResponseSuccess(c, name)
}

// PackageRead 读取多配置机器人的 package.json
func PackageRead(c *gin.Context) {
	name := c.PostForm("name")
	if name == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "name 不能为空")
		return
	}
	if !paths.MultiBotExists(name) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "多配置机器人不存在")
		return
	}
	pkgPath := paths.GetMultiBotPKGPath(name)
	if _, err := os.Stat(pkgPath); os.IsNotExist(err) {
		response.ResponseSuccess(c, "")
		return
	}
	data, err := os.ReadFile(pkgPath)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusInternalServerError, http.StatusInternalServerError, "读取 package.json 失败")
		return
	}
	response.ResponseSuccess(c, string(data))
}

// PackageUpdate 更新多配置机器人的 package.json
func PackageUpdate(c *gin.Context) {
	name := c.PostForm("name")
	content := c.PostForm("content")
	if name == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "name 不能为空")
		return
	}
	if !paths.MultiBotExists(name) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "多配置机器人不存在")
		return
	}
	pkgPath := paths.GetMultiBotPKGPath(name)
	if err := os.WriteFile(pkgPath, []byte(content), 0644); err != nil {
		response.ResponseErrorWithMsg(c, http.StatusInternalServerError, http.StatusInternalServerError, "写入 package.json 失败")
		return
	}
	response.ResponseSuccess(c, nil)
}
