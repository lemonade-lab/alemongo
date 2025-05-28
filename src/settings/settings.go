package settings

import (
	"fmt"
	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
	"log"
	"path"
	"time"
)

const (
	ServiceName        = "alemongo"
	ServiceDescription = "web service"
)

var Conf = new(AppConfig)

type AppConfig struct {
	Name          string `mapstructure:"name"`
	Mode          string `mapstructure:"mode"`
	*ServerConfig `mapstructure:"server"`
	*LogConfig    `mapstructure:"log"`
}

type ServerConfig struct {
	Host         string `mapstructure:"host"`
	Port         string `mapstructure:"port"`
	*TokenConfig `mapstructure:"token"`
}

type TokenConfig struct {
	Key         string        `mapstructure:"key"`
	ExpiresTime time.Duration `mapstructure:"expires_time"`
}

type LogConfig struct {
	Level    string `mapstructure:"level"`
	Filename string `mapstructure:"filename"`
}

// 设置默认值
func setDefaults() {
	if Conf.Name == "" {
		Conf.Name = "alemongo"
	}
	if Conf.Mode == "" {
		Conf.Mode = "dev"
	}
	if Conf.ServerConfig.Host == "" {
		Conf.ServerConfig.Host = "127.0.0.1"
	}
	if Conf.ServerConfig.Port == "" {
		Conf.ServerConfig.Port = "17187"
	}
	if Conf.TokenConfig.Key == "" {
		Conf.TokenConfig.Key = "alemongo"
	}
	if Conf.TokenConfig.ExpiresTime <= 0 {
		Conf.TokenConfig.ExpiresTime = 1
	}
	if Conf.LogConfig.Level == "" {
		Conf.LogConfig.Level = "debug"
	}
	if Conf.LogConfig.Filename == "" {
		Conf.LogConfig.Filename = "alemongo.log"
	}
}

// 初始化配置信息
func Init(filepath string) (err error) {
	fmt.Printf("config file path: %s\n", filepath)
	viper.SetConfigFile(filepath)
	err = viper.ReadInConfig()
	if err != nil {
		fmt.Printf("viper.ReadInConfig failed, err:%v\n", err)
		return
	}

	if err := viper.Unmarshal(Conf); err != nil {
		fmt.Printf("viper.Unmarshal failed, err:%v\n", err)
	}

	// 默认配置
	setDefaults()

	viper.WatchConfig()
	viper.OnConfigChange(func(in fsnotify.Event) {
		fmt.Printf("config file changed: %v\n", in.Name)
		if err := viper.Unmarshal(Conf); err != nil {
			fmt.Printf("viper.Unmarshal failed, err:%v\n", err)
		}
	})
	return
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
	server := Conf.ServerConfig
	// 打印信息
	log.Println("http://" + server.Host + ":" + server.Port)
}
