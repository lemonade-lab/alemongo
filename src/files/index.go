package files

import (
	"alemongo/src/paths"
	"embed"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/gin-gonic/gin"
)

// init 函数用于解压资源
func Create(ResourcesFiles fs.FS) {
	workPAth := paths.GetWorkPath()
	// 解压资源
	err := fs.WalkDir(ResourcesFiles, ".", func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		// 计算目标路径
		targetPath := path.Join(workPAth, p)
		// 如果是目录
		if d.IsDir() {
			// 创建目录
			if err := os.MkdirAll(targetPath, os.ModePerm); err != nil {
				return err
			}
		} else {
			// 打开文件
			curFile, err := ResourcesFiles.Open(p)
			if err != nil {
				return err
			}
			// 关闭文件
			defer curFile.Close()

			// 打开文件
			file, err := os.Create(targetPath)
			if err != nil {
				return err
			}
			// 关闭文件
			defer file.Close()

			// 复制文件
			if _, err := io.Copy(file, curFile); err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		log.Println("资源初始化失败:", err)
		return
	}

	log.Println("资源初始化完成")
}

// 文件服务
func CreateFileServer(ctx *gin.Context, staticFiles embed.FS) {
	// 检查请求路径是否以 /api 开头
	if strings.HasPrefix(ctx.Request.URL.Path, "/api") {
		// 如果是 /api 开头的路径，返回 404
		ctx.JSON(http.StatusNotFound, gin.H{"error": "API route not found"})
		return
	}

	// 创建一个子文件系统，指向 dist 目录
	distFS, _ := fs.Sub(staticFiles, "dist")

	// 创建一个文件服务
	fileServer := http.FileServer(http.FS(distFS))

	// 检查文件是否存在
	_, err := distFS.Open(strings.TrimPrefix(ctx.Request.URL.Path, "/"))
	if err != nil {
		// 如果文件不存在，返回 index.html
		ctx.Request.URL.Path = "/"
	}

	// 使用文件服务处理请求
	fileServer.ServeHTTP(ctx.Writer, ctx.Request)
}
