package main

import (
	"alemongo/src/apps/route"
	"alemongo/src/config"
	"alemongo/src/files"
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

	app := route.Create()

	// 处理静态文件服务
	app.NoRoute(func(ctx *gin.Context) {
		files.CreateFileServer(ctx, staticFiles)
	})

	config.LogServerInfo()

	// 监听并在 0.0.0.0:8080 上启动服务
	if err := app.Run(":" + config.Get().Server.Port); err != nil {
		log.Fatal(err)
	}
}
