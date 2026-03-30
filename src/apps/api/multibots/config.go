package multibots

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/paths"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type ConfigHistoryItem struct {
	ID        string `json:"id"`
	CreateAt  string `json:"create_at"`
	Size      int64  `json:"size"`
	FileName  string `json:"file_name"`
	Timestamp int64  `json:"timestamp"`
}

func getConfigFilePath(configsPath, name string) string {
	for _, ext := range []string{".yaml", ".yml"} {
		fp := filepath.Join(configsPath, name+ext)
		if _, err := os.Stat(fp); err == nil {
			return fp
		}
	}
	return ""
}

func getConfigHistoryDir(botName, name string) string {
	return filepath.Join(paths.GetMultiBotConfigPath(botName), ".history", name)
}

func writeConfigHistorySnapshot(botName, name, content string) {
	if content == "" {
		return
	}
	historyDir := getConfigHistoryDir(botName, name)
	if err := os.MkdirAll(historyDir, 0755); err != nil {
		return
	}
	historyID := strconv.FormatInt(time.Now().UnixMilli(), 10)
	_ = os.WriteFile(filepath.Join(historyDir, historyID+".yaml"), []byte(content), 0644)
}

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
	writeConfigHistorySnapshot(botName, name, content)
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
	configFilePath := getConfigFilePath(configsPath, name)
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
	configFilePath := getConfigFilePath(configsPath, name)
	oldContent := ""
	if configFilePath != "" {
		if data, err := os.ReadFile(configFilePath); err == nil {
			oldContent = string(data)
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
	if oldContent != "" {
		writeConfigHistorySnapshot(botName, name, oldContent)
	}
	writeConfigHistorySnapshot(botName, name, content)
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

// ConfigHistoryList 获取配置文件编辑历史
func ConfigHistoryList(c *gin.Context) {
	botName := c.Query("bot_name")
	name := c.Query("name")
	if botName == "" || name == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot_name 和 name 不能为空")
		return
	}
	if !paths.MultiBotExists(botName) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "多配置机器人不存在")
		return
	}

	historyDir := getConfigHistoryDir(botName, name)
	entries, err := os.ReadDir(historyDir)
	if err != nil {
		response.ResponseSuccess(c, []ConfigHistoryItem{})
		return
	}

	items := make([]ConfigHistoryItem, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		ext := filepath.Ext(entry.Name())
		if ext != ".yaml" && ext != ".yml" {
			continue
		}
		fi, err := entry.Info()
		if err != nil {
			continue
		}
		id := strings.TrimSuffix(entry.Name(), ext)
		ts := fi.ModTime().UnixMilli()
		if parsed, err := strconv.ParseInt(id, 10, 64); err == nil {
			ts = parsed
		}
		items = append(items, ConfigHistoryItem{
			ID:        id,
			CreateAt:  fi.ModTime().Format("2006-01-02 15:04:05"),
			Size:      fi.Size(),
			FileName:  entry.Name(),
			Timestamp: ts,
		})
	}

	sort.Slice(items, func(i, j int) bool {
		return items[i].Timestamp > items[j].Timestamp
	})

	response.ResponseSuccess(c, items)
}

// ConfigHistoryRead 读取某个历史版本内容
func ConfigHistoryRead(c *gin.Context) {
	botName := c.PostForm("bot_name")
	name := c.PostForm("name")
	historyID := c.PostForm("history_id")
	if botName == "" || name == "" || historyID == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot_name、name、history_id 不能为空")
		return
	}
	if !paths.MultiBotExists(botName) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "多配置机器人不存在")
		return
	}

	historyFile := filepath.Join(getConfigHistoryDir(botName, name), historyID+".yaml")
	data, err := os.ReadFile(historyFile)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusNotFound, http.StatusNotFound, "历史版本不存在")
		return
	}
	response.ResponseSuccess(c, string(data))
}

// ConfigHistoryRestore 恢复某个历史版本
func ConfigHistoryRestore(c *gin.Context) {
	botName := c.PostForm("bot_name")
	name := c.PostForm("name")
	historyID := c.PostForm("history_id")
	if botName == "" || name == "" || historyID == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "bot_name、name、history_id 不能为空")
		return
	}
	if !paths.MultiBotExists(botName) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "多配置机器人不存在")
		return
	}

	historyFile := filepath.Join(getConfigHistoryDir(botName, name), historyID+".yaml")
	targetContent, err := os.ReadFile(historyFile)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusNotFound, http.StatusNotFound, "历史版本不存在")
		return
	}

	configsPath := paths.GetMultiBotConfigPath(botName)
	configFilePath := getConfigFilePath(configsPath, name)
	if configFilePath == "" {
		configFilePath = filepath.Join(configsPath, name+".yaml")
	}

	if currentData, err := os.ReadFile(configFilePath); err == nil {
		writeConfigHistorySnapshot(botName, name, string(currentData))
	}
	if err := os.WriteFile(configFilePath, targetContent, 0644); err != nil {
		response.ResponseErrorWithMsg(c, http.StatusInternalServerError, http.StatusInternalServerError, "恢复失败")
		return
	}
	writeConfigHistorySnapshot(botName, name, string(targetContent))

	response.ResponseSuccess(c, string(targetContent))
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
