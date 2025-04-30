package config

import (
	"log"
	"os"
	"path"
	"time"

	"gopkg.in/yaml.v2"
)

var cfg Config

// 设置默认值
func setDefaults() {
	if cfg.Server.Host == "" {
		cfg.Server.Host = "localhost"
	}
	if cfg.Server.Port == "" {
		cfg.Server.Port = "17187"
	}
	if cfg.Server.Key == "" {
		cfg.Server.Key = "alemongo"
	}
}

// 包初始化自动加载函数
func init() {
	// 读取配置文件
	data, err := os.ReadFile("config.yaml")
	if err != nil {
		log.Printf("未设置运行配置，可创建文件 config.yaml 进行调整: %v", err)
	}

	// 解析配置文件
	if err == nil {
		if err := yaml.Unmarshal(data, &cfg); err != nil {
			log.Printf("解析 config.yaml 失败: %v", err)
		}
	}

	// 设置默认值
	setDefaults()
}

// 获取配置
func Get() Config {
	return cfg
}

// 保存配置到文件
func Save() {
	data, err := yaml.Marshal(cfg)
	if err != nil {
		log.Printf("配置序列化失败: %v", err)
		return
	}
	err = os.WriteFile("config.yaml", data, 0644)
	if err != nil {
		log.Printf("保存配置到文件失败: %v", err)
		return
	}
	log.Println("配置已成功保存到 config.yaml")
}

// 获取工作目录
func GetWorkPath() string {
	return path.Join("work")
}

// 获取资源目录
func GetResourcesPath() string {
	return path.Join(GetWorkPath(), "resources")
}

// 获取目录
func GetConfigsPath() string {
	configsPath := path.Join(GetWorkPath(), "configs")
	return configsPath
}

var processRunAt string

// 获取当前进程运行时间
func GetProcessRunAT() string {
	if processRunAt == "" {
		processRunAt = time.Now().Format("2006-01-02 15:04:05")
	}
	return processRunAt
}

// 打印服务信息
func LogServerInfo() {
	server := Get().Server
	// 打印信息
	log.Println("http://" + server.Host + ":" + server.Port)
}
