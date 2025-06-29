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
	"embed"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

//go:embed resources/**/* resources/*
var ResourcesFiles embed.FS

//go:embed dist/**/* dist/*
var staticFiles embed.FS

// 构建时指定version，方便迭代更新
var Version = "dev"

// 是否是docker启动
var IsDocker = false

// 主函数
func main() {
	// 输出当前版本号
	fmt.Println("Version: ", Version)

	var configFilePath string
	mode := settings.Conf.Mode // 默认模式

	// 解析命令行参数
	args := os.Args[1:] // 跳过程序名
	for i, arg := range args {
		lowerArg := strings.ToLower(arg)
		if lowerArg == "debug" {
			mode = gin.DebugMode
			configFilePath = "config.dev.yaml" // 默认开发模式配置文件
		}
		if lowerArg == "test" {
			mode = gin.TestMode
			configFilePath = "config.test.yaml" // 默认测试模式配置文件
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
