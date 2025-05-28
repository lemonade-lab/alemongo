package common

import (
	"alemongo/src/settings"
	"alemongo/src/utils"
	"net/http"
	"runtime"
	"strings"

	"github.com/gin-gonic/gin"
)

func getCommandOutput(name string, arg ...string) (string, bool) {
	cmd := utils.Command(name, arg...)
	output, err := cmd.Output()
	if err != nil {
		return "", false
	}
	// Trim any trailing newline or whitespace
	return strings.TrimSpace(string(output)), true
}

func getNVMJS() (string, bool) {
	// Check if Node.js is installed
	return getCommandOutput("nvm", "--version")
}

func getNodeJS() (string, bool) {
	// Check if Node.js is installed
	return getCommandOutput("node", "--version")
}

func getBrowser() (string, bool) {
	if runtime.GOOS == "linux" {
		// 判断 chromium 或 chromium-browser
		message, installed := getCommandOutput("chromium", "--version")
		if installed {
			return message, installed
		}
		message, installed = getCommandOutput("chromium-browser", "--version")
		if installed {
			return message, installed
		}
		return "", false
	} else if runtime.GOOS == "windows" {
		return "", false
	} else if runtime.GOOS == "darwin" {
		return "", false
	}
	return "", false
}

func getGit() (string, bool) {
	// Check if Git is installed
	return getCommandOutput("git", "--version")
}

func Info(ctx *gin.Context) {
	// 1) 检查 nvm 是否安装
	nvmVersion, isNvmInstalled := getNVMJS()
	// 2) 检查 node 是否安装
	nodeVersion, isNodeInstalled := getNodeJS()
	// 3) 检查浏览器是否安装
	browserVersion, isBrowserInstalled := getBrowser()
	// 4) 检查 git 是否安装
	gitVersion, isGitInstalled := getGit()

	ip, err := getPublicIP()
	curIP := ""
	if err != nil {
		ip, err := getPrivateIP()
		if err == nil {
			curIP = ip
		}
	} else {
		curIP = ip
	}

	// 返回 JSON 响应
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": InfoResponse{
			NVM: ToolInfo{
				Installed: isNvmInstalled,
				Version:   nvmVersion,
			},
			Node: ToolInfo{
				Installed: isNodeInstalled,
				Version:   nodeVersion,
			},
			Browser: ToolInfo{
				Installed: isBrowserInstalled,
				Version:   browserVersion,
			},
			Git: ToolInfo{
				Installed: isGitInstalled,
				Version:   gitVersion,
			},
			StartAt:  settings.GetProcessRunAT(),
			Location: curIP,
		},
	})
}
