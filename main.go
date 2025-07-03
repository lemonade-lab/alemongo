package main

import (
	"alemongo/src/core/autoregister"
	"alemongo/src/core/process"
	"alemongo/src/dao"
	"alemongo/src/files"
	"alemongo/src/logger"
	"alemongo/src/pkgs/email"
	"alemongo/src/route"
	"alemongo/src/settings"
	"alemongo/src/utils"
	"bufio"
	"embed"
	"fmt"
	"log"
	"net"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

//go:embed resources/**/* resources/*
var ResourcesFiles embed.FS

//go:embed dist/**/* dist/*
var staticFiles embed.FS

// 构建时指定version，方便迭代更新
var Version = "0.0.1"

// 构建时指定build time
var BuildTime = time.Now().Format("20060102-150405")

// 检查端口是否被占用
func isPortInUse(port string) bool {
	ln, err := net.Listen("tcp", ":"+port)
	if err != nil {
		return true
	}
	ln.Close()
	return false
}

// 获取占用端口的进程ID
func getPortPID(port string) (string, error) {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("netstat", "-ano")
	case "darwin", "linux":
		cmd = exec.Command("lsof", "-i", ":"+port)
	default:
		return "", fmt.Errorf("不支持的操作系统")
	}

	output, err := cmd.Output()
	if err != nil {
		return "", err
	}

	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.Contains(line, ":"+port) {
			fields := strings.Fields(line)
			if len(fields) > 0 {
				if runtime.GOOS == "windows" {
					// Windows netstat 格式
					for i, field := range fields {
						if strings.Contains(field, ":"+port) && i+3 < len(fields) {
							return fields[len(fields)-1], nil
						}
					}
				} else {
					// macOS/Linux lsof 格式
					if len(fields) >= 2 {
						return fields[1], nil
					}
				}
			}
		}
	}
	return "", fmt.Errorf("未找到占用端口的进程")
}

// 杀死进程
func killProcess(pid string) error {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("taskkill", "/F", "/PID", pid)
	case "darwin", "linux":
		cmd = exec.Command("kill", "-9", pid)
	default:
		return fmt.Errorf("不支持的操作系统")
	}

	return cmd.Run()
}

// 询问用户是否要杀死占用端口的进程
func askToKillProcess(port string) bool {
	fmt.Printf("端口 %s 被占用，是否要关闭占用该端口的进程？(y/N): ", port)

	reader := bufio.NewReader(os.Stdin)
	input, err := reader.ReadString('\n')
	if err != nil {
		return false
	}

	input = strings.TrimSpace(strings.ToLower(input))
	return input == "y" || input == "yes"
}

// 处理端口占用问题
func handlePortConflict(port string, isDev bool) error {
	if !isPortInUse(port) {
		return nil
	}

	if !isDev {
		return fmt.Errorf("端口 %s 已被占用", port)
	}

	fmt.Printf("检测到端口 %s 已被占用\n", port)

	// 获取占用端口的进程ID
	pid, err := getPortPID(port)
	if err != nil {
		fmt.Printf("无法获取占用端口的进程信息: %v\n", err)
		return fmt.Errorf("端口 %s 已被占用", port)
	}

	fmt.Printf("占用端口的进程ID: %s\n", pid)

	if askToKillProcess(port) {
		fmt.Printf("正在关闭进程 %s...\n", pid)
		if err := killProcess(pid); err != nil {
			return fmt.Errorf("关闭进程失败: %v", err)
		}
		fmt.Println("进程已关闭")

		// 等待一下确保端口释放
		for i := 0; i < 10; i++ {
			if !isPortInUse(port) {
				break
			}
			fmt.Print(".")
			// 简单延时
			for j := 0; j < 100000000; j++ {
			}
		}
		fmt.Println()

		if isPortInUse(port) {
			return fmt.Errorf("端口 %s 仍被占用", port)
		}
	} else {
		return fmt.Errorf("用户取消启动")
	}

	return nil
}

// 主函数
func main() {

	var configFilePath string
	mode := settings.Conf.Mode // 默认模式
	isDev := false

	// 解析命令行参数
	args := os.Args[1:] // 跳过程序名
	for i, arg := range args {
		lowerArg := strings.ToLower(arg)
		if lowerArg == "debug" {
			mode = gin.DebugMode
			isDev = true
			configFilePath = "config.dev.yaml" // 默认开发模式配置文件
			Version = gin.DebugMode

		}
		if lowerArg == "test" {
			mode = gin.TestMode
			configFilePath = "config.test.yaml" // 默认测试模式配置文件
			Version = gin.TestMode
		}
		if lowerArg == "config" || lowerArg == "-config" || lowerArg == "--config" {
			// 检查是否有下一个参数作为配置文件路径
			if i+1 < len(args) {
				configFilePath = args[i+1]
				fmt.Printf("使用配置文件: %s\n", configFilePath)
			} else {
				log.Fatal("config 参数需要指定配置文件路径，例如: ./app config ./config.yaml")
			}
		}
	}

	settings.SetBaseInfo(Version, BuildTime) // 设置版本和构建时间

	if configFilePath != "" && configFilePath != "config.yaml" {
		// 检查配置文件是否存在
		if _, err := os.Stat(configFilePath); os.IsNotExist(err) {
			configFilePath = ""
		}
	}

	if err := settings.Init(configFilePath); err != nil {
		log.Printf("load config failed, err:%v\n", err)
		return
	}

	// 打印当前工作目录
	cwd, err := os.Getwd()
	if err != nil {
		log.Fatalf("获取当前工作目录失败:\n%v", err)
		return
	}
	log.Printf("当前工作目录:\n%s", cwd)

	if err := logger.Init(settings.Conf.Log, settings.Conf.Mode); err != nil {
		log.Printf("init logger failed, err:%v\n", err)
		return
	}

	// 在开发模式下检查端口占用
	if isDev {
		if err := handlePortConflict(settings.Conf.Server.Port, true); err != nil {
			log.Fatalf("端口处理失败: %v", err)
			return
		}
	}

	// 初始化文件资源
	files.Create(ResourcesFiles)
	// 依赖注入，生成环境下用于重置bot template
	utils.SetFS(ResourcesFiles)

	// 获得全局进程管理
	pm := process.GetProcessManager()
	_ = pm.ReviveAll() // 复活所有进程

	// 创建路由
	app := route.Create(mode)

	// 处理静态文件服务
	app.NoRoute(func(ctx *gin.Context) {
		files.CreateFileServer(ctx, staticFiles)
	})

	// 打印服务器信息
	settings.LogServerInfo()

	// 初始化密码
	dao.InitAdmin()

	// 初始化邮件发送者
	email.InitEmailSender(settings.Conf.SMTP)

	// 初始化go-cache
	utils.InitCache()

	// 注册服务
	autoregister.RegisterIfNeeded(settings.ServiceName, settings.ServiceDescription)

	err = app.Run(":" + settings.Conf.Server.Port)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
		return
	}
}
