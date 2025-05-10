package main

import (
	"alemongo/src/apps/route"
	"alemongo/src/config"
	"alemongo/src/core/autoregister"
	"alemongo/src/files"
	"alemongo/src/users"
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
	// 打印当前工作目录
	cwd, err := os.Getwd()
	if err != nil {
		log.Fatalf("获取当前工作目录失败:\n%v", err)
		return
	}
	log.Printf("当前工作目录:\n%s", cwd)

	// 初始化文件资源
	files.Create(ResourcesFiles)

	// 创建路由
	app := route.Create()

	// 处理静态文件服务
	app.NoRoute(func(ctx *gin.Context) {
		files.CreateFileServer(ctx, staticFiles)
	})

	// 打印服务器信息
	config.LogServerInfo()

	admin := users.GetAdminAccount()

	// 判断是否存在
	if admin.PassWord == "" {
		log.Printf("临时超级管理员账户生成失败，请阅读文档以自定义")
	} else {
		log.Printf("临时超级管理员账户信息：\nusername: %s\npassword: %s\n", admin.UserName, admin.PassWord)
	}

	registerRrr := autoregister.RegisterIfNeeded(config.ServiceName, config.ServiceDescription)
	if registerRrr != nil {
		log.Fatalf("注册服务失败: %v", err)
		return
	}

	err = app.Run(":" + config.Get().Server.Port)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
		return
	}

}
