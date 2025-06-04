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
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

//go:embed resources/**/* resources/*
var ResourcesFiles embed.FS

//go:embed dist/**/* dist/*
var staticFiles embed.FS

// 主函数
func main() {
	var configFilePath string
	// 检查是否输入配置文件路径
	if len(os.Args) == 2 {
		configFilePath = os.Args[1]
	}

	// 打印当前工作目录
	cwd, err := os.Getwd()
	if err != nil {
		log.Fatalf("获取当前工作目录失败:\n%v", err)
		return
	}
	log.Printf("当前工作目录:\n%s", cwd)

	if err := settings.Init(configFilePath); err != nil {
		log.Printf("load config failed, err:%v\n", err)
		return
	}

	if err := logger.Init(settings.Conf.Log, settings.Conf.Mode); err != nil {
		log.Printf("init logger failed, err:%v\n", err)
		return
	}

	// 初始化文件资源
	files.Create(ResourcesFiles)

	// 获得全局进程管理
	pm := process.GetProcessManager()
	_ = pm.ReviveAll() // 复活所有进程

	// 创建路由
	app := route.Create(settings.Conf.Mode)

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
