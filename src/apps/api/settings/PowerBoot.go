package settings

import (
	"alemongo/src/core/autoregister"
	"alemongo/src/settings"
	"alemongo/src/utils"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/gin-gonic/gin"
)

// 开机自启
func PowerBoot(ctx *gin.Context) {
	checked := ctx.Query("checked")

	// 只在 macOS 和 Linux 上支持开机自启动
	if runtime.GOOS != "darwin" && runtime.GOOS != "linux" {
		ctx.JSON(200, gin.H{
			"code": 400,
			"msg":  "当前操作系统不支持开机自启动功能",
			"data": nil,
		})
		return
	}

	// 取值 0 则 取消开机自启动
	if checked == "0" {
		if err := disableAutoStart(); err != nil {
			ctx.JSON(200, gin.H{
				"code": 500,
				"msg":  "取消开机自启动失败: " + err.Error(),
				"data": nil,
			})
			return
		}
		ctx.JSON(200, gin.H{
			"code": 200,
			"msg":  "已取消开机自启动",
			"data": nil,
		})
		return
	}

	// 取值 1 则 启用开机自启动
	if checked == "1" {
		if err := enableAutoStart(); err != nil {
			ctx.JSON(200, gin.H{
				"code": 500,
				"msg":  "启用开机自启动失败: " + err.Error(),
				"data": nil,
			})
			return
		}
		ctx.JSON(200, gin.H{
			"code": 200,
			"msg":  "已启用开机自启动",
			"data": nil,
		})
		return
	}

	ctx.JSON(200, gin.H{
		"code": 400,
		"msg":  "参数错误，checked 必须为 0 或 1",
		"data": nil,
	})
}

// enableAutoStart 启用开机自启动
func enableAutoStart() error {
	execPath, err := os.Executable()
	if err != nil {
		return err
	}

	switch runtime.GOOS {
	case "darwin":
		return enableMacOSAutoStart(execPath)
	case "linux":
		return enableLinuxAutoStart(execPath)
	default:
		return nil
	}
}

// disableAutoStart 禁用开机自启动
func disableAutoStart() error {
	switch runtime.GOOS {
	case "darwin":
		return disableMacOSAutoStart()
	case "linux":
		return disableLinuxAutoStart()
	default:
		return nil
	}
}

// enableMacOSAutoStart 启用 macOS 开机自启动
func enableMacOSAutoStart(execPath string) error {
	// 使用 autoregister 包注册服务
	autoregister.RegisterIfNeeded(settings.ServiceName, settings.ServiceDescription)
	return nil
}

// disableMacOSAutoStart 禁用 macOS 开机自启动
func disableMacOSAutoStart() error {
	plistPath := filepath.Join(os.Getenv("HOME"), "Library/LaunchAgents", settings.ServiceName+".plist")

	// 先卸载服务
	unloadCmd := utils.Command("launchctl", "unload", plistPath)
	unloadCmd.Run() // 忽略错误，因为可能服务本来就没加载

	// 删除 plist 文件
	if err := os.Remove(plistPath); err != nil && !os.IsNotExist(err) {
		return err
	}

	return nil
}

// enableLinuxAutoStart 启用 Linux 开机自启动
func enableLinuxAutoStart(execPath string) error {
	// 使用 autoregister 包注册服务
	autoregister.RegisterIfNeeded(settings.ServiceName, settings.ServiceDescription)
	return nil
}

// disableLinuxAutoStart 禁用 Linux 开机自启动
func disableLinuxAutoStart() error {
	// 禁用 systemd 服务
	disableCmd := utils.Command("systemctl", "disable", settings.ServiceName)
	if err := disableCmd.Run(); err != nil {
		return err
	}

	// 停止服务
	stopCmd := utils.Command("systemctl", "stop", settings.ServiceName)
	stopCmd.Run() // 忽略错误

	// 删除服务文件
	servicePath := "/etc/systemd/system/" + settings.ServiceName + ".service"
	if err := os.Remove(servicePath); err != nil && !os.IsNotExist(err) {
		return err
	}

	// 重新加载 systemd
	reloadCmd := utils.Command("systemctl", "daemon-reload")
	return reloadCmd.Run()
}

// GetAutoStartStatus 获取开机自启动状态
func GetAutoStartStatus(ctx *gin.Context) {
	if runtime.GOOS != "darwin" && runtime.GOOS != "linux" {
		ctx.JSON(200, gin.H{
			"code": 200,
			"msg":  "success",
			"data": gin.H{
				"enabled":   false,
				"supported": false,
			},
		})
		return
	}

	var enabled bool
	var err error

	switch runtime.GOOS {
	case "darwin":
		enabled, err = checkMacOSAutoStartStatus()
	case "linux":
		enabled, err = checkLinuxAutoStartStatus()
	default:
		enabled = false
	}

	if err != nil {
		ctx.JSON(200, gin.H{
			"code": 500,
			"msg":  "获取状态失败: " + err.Error(),
			"data": nil,
		})
		return
	}

	ctx.JSON(200, gin.H{
		"code": 200,
		"msg":  "success",
		"data": gin.H{
			"enabled":   enabled,
			"supported": true,
		},
	})
}

// checkMacOSAutoStartStatus 检查 macOS 开机自启动状态
func checkMacOSAutoStartStatus() (bool, error) {
	// 检查 plist 文件是否存在
	plistPath := filepath.Join(os.Getenv("HOME"), "Library/LaunchAgents", settings.ServiceName+".plist")
	if _, err := os.Stat(plistPath); os.IsNotExist(err) {
		return false, nil
	}

	// 检查服务是否已加载
	cmd := utils.Command("launchctl", "list")
	output, err := cmd.Output()
	if err != nil {
		return false, err
	}

	return strings.Contains(string(output), settings.ServiceName), nil
}

// checkLinuxAutoStartStatus 检查 Linux 开机自启动状态
func checkLinuxAutoStartStatus() (bool, error) {
	cmd := utils.Command("systemctl", "is-enabled", settings.ServiceName)
	err := cmd.Run()
	return err == nil, nil
}
