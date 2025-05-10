package common

import (
	"alemongo/src/config"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"

	"github.com/gin-gonic/gin"
)

func Info(ctx *gin.Context) {
	// Helper function to execute a command and fetch its output
	getCommandOutput := func(name string, arg ...string) (string, bool) {
		cmd := exec.Command(name, arg...)
		cmd.Env = os.Environ() // 每次都用当前进程的环境变量
		output, err := cmd.Output()
		if err != nil {
			return "", false
		}
		// Trim any trailing newline or whitespace
		return strings.TrimSpace(string(output)), true
	}

	// Detect the browser command based on the operating system
	var browserCmd string
	switch runtime.GOOS {
	case "darwin": // macOS
		browserCmd = "google-chrome"
	case "windows": // Windows
		browserCmd = "chrome"
	default: // Linux and other systems
		browserCmd = "chromium"
	}

	// 1) 检查 nvm 是否安装
	nvmVersion, isNvmInstalled := getCommandOutput("nvm", "--version")

	// 2) 检查 node 是否安装
	nodeVersion, isNodeInstalled := getCommandOutput("node", "--version")

	// 3) 检查浏览器是否安装
	browserVersion, isBrowserInstalled := getCommandOutput(browserCmd, "--version")

	// 4) 检查 git 是否安装
	gitVersion, isGitInstalled := getCommandOutput("git", "--version")

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
			StartAt:  config.GetProcessRunAT(),
			Location: curIP,
		},
	})
}
