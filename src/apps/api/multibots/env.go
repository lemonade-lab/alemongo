package multibots

import (
	config "alemongo/src/paths"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// EnvRead 读取多配置机器人环境变量
func EnvRead(c *gin.Context) {
	name := c.PostForm("name")
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
			"data": nil,
		})
		return
	}
	if !config.MultiBotExists(name) {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "多配置机器人不存在",
			"data": nil,
		})
		return
	}
	envPath := config.GetMultiBotEnvPath(name)
	if _, err := os.Stat(envPath); os.IsNotExist(err) {
		err := os.WriteFile(envPath, []byte(""), 0644)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"code": http.StatusInternalServerError,
				"msg":  "创建环境文件失败",
				"data": err,
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"code": http.StatusOK,
			"msg":  "环境文件不存在，已创建空文件",
			"data": "",
		})
		return
	}
	content, err := os.ReadFile(envPath)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "读取失败",
			"data": "",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "读取成功",
		"data": string(content),
	})
}

// EnvUpdate 更新多配置机器人环境变量
func EnvUpdate(c *gin.Context) {
	name := c.PostForm("name")
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "机器人名不能为空",
			"data": nil,
		})
		return
	}
	if !config.MultiBotExists(name) {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "多配置机器人不存在",
			"data": nil,
		})
		return
	}
	envPath := config.GetMultiBotEnvPath(name)
	if _, err := os.Stat(envPath); os.IsNotExist(err) {
		err := os.WriteFile(envPath, []byte(""), 0644)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"code": http.StatusInternalServerError,
				"msg":  "创建环境文件失败",
				"data": err,
			})
			return
		}
	}
	content := c.PostForm("content")
	if err := os.WriteFile(envPath, []byte(content), 0644); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "更新失败",
			"data": nil,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "更新成功",
		"data": nil,
	})
}
