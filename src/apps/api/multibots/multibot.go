package multibots

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/core/process"
	"alemongo/src/logic"
	config "alemongo/src/paths"
	"alemongo/src/utils"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

// MultiBotInfo 多配置机器人信息
type MultiBotInfo struct {
	Name        string             `json:"name"`
	Configs     []string           `json:"configs"`
	NodeModules bool               `json:"node_modules"`
	CreateAt    string             `json:"create_at"`
	Instances   []MultiBotInstance `json:"instances"`
}

// MultiBotInstance 单个配置实例的运行状态
type MultiBotInstance struct {
	ConfigName  string `json:"config_name"`
	ProcessName string `json:"process_name"`
	Status      int    `json:"status"` // 0: 停止, 1: 运行中
	Pid         int    `json:"pid"`
}

// @summary 多配置机器人列表
// @description 获取所有多配置机器人及其实例状态
// @tags 机器人
// @produce json
// @success 200 {object} response.ResponseData{data=[]MultiBotInfo} "成功"
// @router /api/v1/multibot/list [get]
func ListMultiBots(c *gin.Context) {
	multiBotsPath := config.GetMultiBotsPath()
	names, err := utils.GetDirNames(multiBotsPath)
	if err != nil {
		response.ResponseSuccess(c, []MultiBotInfo{})
		return
	}

	pm := process.GetProcessManager()
	var result []MultiBotInfo

	for _, name := range names {
		botPath := config.GetMultiBotPath(name)
		fileInfo, _ := os.Stat(botPath)
		createAt := ""
		if fileInfo != nil {
			createAt = fileInfo.ModTime().Format("2006-01-02 15:04:05")
		}

		nodeModules := config.ExistsMultiBotNodeModules(name)

		// 读取 configs 目录
		configsPath := filepath.Join(botPath, "configs")
		var configNames []string
		var instances []MultiBotInstance

		if entries, err := os.ReadDir(configsPath); err == nil {
			for _, entry := range entries {
				if entry.IsDir() {
					continue
				}
				ext := filepath.Ext(entry.Name())
				if ext != ".yaml" && ext != ".yml" {
					continue
				}
				cfgName := strings.TrimSuffix(entry.Name(), ext)
				configNames = append(configNames, cfgName)

				processName := name + ":" + cfgName
				inst := MultiBotInstance{
					ConfigName:  cfgName,
					ProcessName: processName,
					Status:      0,
					Pid:         0,
				}
				proc := pm.GetProcess(processName)
				if proc != nil {
					status, pid := proc.Info()
					if status == "running" {
						inst.Status = 1
						inst.Pid = pid
					}
				}
				instances = append(instances, inst)
			}
		}

		result = append(result, MultiBotInfo{
			Name:        name,
			Configs:     configNames,
			NodeModules: nodeModules,
			CreateAt:    createAt,
			Instances:   instances,
		})
	}

	response.ResponseSuccess(c, result)
}

// @summary 创建多配置机器人
// @description 创建多配置机器人
// @tags 机器人
// @accept x-www-form-urlencoded
// @produce json
// @param name formData string true "机器人名"
// @success 200 {object} response.ResponseData{data=string} "创建成功"
// @failure 400 {object} response.ResponseData "参数错误"
// @failure 500 {object} response.ResponseData "创建失败"
// @router /api/v1/bot/create/multi [post]
func CreateMultiConfigBot(c *gin.Context) {
	name := c.PostForm("name")
	if name == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, response.RobotNameIsEmpty, "机器人名不能为空")
	}

	targetPath, err := logic.CreateMultiBot(name)
	if err != response.CodeSuccess {
		response.ResponseError(c, http.StatusInternalServerError, err)
		return
	}
	response.ResponseSuccess(c, targetPath)
}

// @summary 启动多配置机器人
// @description 启动多配置机器人
// @tags 机器人
// @accept x-www-form-urlencoded
// @produce json
// @param name formData string true "机器人名"
// @success 200 {object} response.ResponseData{data=string} "启动成功"
// @failure 400 {object} response.ResponseData "参数错误"
// @failure 500 {object} response.ResponseData "启动失败"
// @router /api/v1/bot/start/multi [post]
func StartMultiBot(c *gin.Context) {
	name := c.PostForm("name")
	if name == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, response.RobotNameIsEmpty, "机器人名不能为空")
		return
	}
	// 读取对应配置，启动机器人
	if !config.MultiBotExists(name) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "多配置机器人不存在")
		return
	}
	msg, err := logic.RunMultiBot(name)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, msg)
		return
	}
	response.ResponseSuccess(c, msg)
}

// @summary 停止多配置机器人
// @description 停止多配置机器人的所有实例
// @tags 机器人
// @accept x-www-form-urlencoded
// @produce json
// @param name formData string true "机器人名"
// @success 200 {object} response.ResponseData{data=string} "停止成功"
// @failure 400 {object} response.ResponseData "参数错误"
// @failure 500 {object} response.ResponseData "停止失败"
// @router /api/v1/multibot/stop [post]
func StopMultiBot(c *gin.Context) {
	name := c.PostForm("name")
	if name == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, response.RobotNameIsEmpty, "机器人名不能为空")
		return
	}
	if !config.MultiBotExists(name) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "多配置机器人不存在")
		return
	}
	msg, err := logic.StopMultiBot(name)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, msg)
		return
	}
	response.ResponseSuccess(c, msg)
}

// @summary 重启多配置机器人
// @description 重启多配置机器人的所有实例
// @tags 机器人
// @accept x-www-form-urlencoded
// @produce json
// @param name formData string true "机器人名"
// @success 200 {object} response.ResponseData{data=string} "重启成功"
// @failure 400 {object} response.ResponseData "参数错误"
// @failure 500 {object} response.ResponseData "重启失败"
// @router /api/v1/multibot/restart [post]
func RestartMultiBot(c *gin.Context) {
	name := c.PostForm("name")
	if name == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, response.RobotNameIsEmpty, "机器人名不能为空")
		return
	}
	if !config.MultiBotExists(name) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "多配置机器人不存在")
		return
	}
	msg, err := logic.RestartMultiBot(name)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, msg)
		return
	}
	response.ResponseSuccess(c, msg)
}

// DeleteMultiBot 删除多配置机器人
func DeleteMultiBot(c *gin.Context) {
	name := c.PostForm("name")
	if name == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, response.RobotNameIsEmpty, "机器人名不能为空")
		return
	}
	log.Printf("删除多配置机器人: %s", name)
	botPath, err := logic.DeleteMultiBot(name)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, err.Error())
		return
	}
	response.ResponseSuccessWithMsg(c, botPath, "多配置机器人删除成功")
}

// InfoMultiBot 获取多配置机器人详情
func InfoMultiBot(c *gin.Context) {
	name := c.PostForm("name")
	if name == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, response.RobotNameIsEmpty, "机器人名不能为空")
		return
	}
	if !config.MultiBotExists(name) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "多配置机器人不存在")
		return
	}
	res, _ := logic.MultiBotInfo(name)
	c.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": res.Data,
	})
}
