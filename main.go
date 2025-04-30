package main

import (
	"alemongo/src/apps/route"
	"alemongo/src/config"
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
		log.Fatalf("获取当前工作目录失败: %v", err)
		return
	}
	log.Printf("当前工作目录: %s\n", cwd)

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
		log.Printf("临时超级管理员账户信息：")
		log.Printf("username: %s", admin.UserName)
		log.Printf("password: %s", admin.PassWord)
	}

	// 监听并在 0.0.0.0:8080 上启动服务
	if err := app.Run(":" + config.Get().Server.Port); err != nil {
		log.Fatal(err)
	}
}
