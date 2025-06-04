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
	Name   string        `mapstructure:"name"`
	Mode   string        `mapstructure:"mode"`
	Server *ServerConfig `mapstructure:"server"`
	Log    *LogConfig    `mapstructure:"log"`
	SMTP   *SMTPConfig   `mapstructure:"smtp"`
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

// 邮件服务的config
type SMTPConfig struct {
	Provider  string `mapstructure:"provider"`
	Host      string `mapstructure:"host"`
	Port      int    `mapstructure:"port"`
	Username  string `mapstructure:"username"`
	Password  string `mapstructure:"password"`
	FromEmail string `mapstructure:"from_email"`
}

// 设置默认值
func setDefaults() {
	Conf = &AppConfig{
		Name: ServiceName,
		Mode: "release",
		Server: &ServerConfig{
			Host: "127.0.0.1",
			Port: "17187",
			TokenConfig: &TokenConfig{
				Key:         "alemongo",
				ExpiresTime: 1,
			},
		},
		Log: &LogConfig{
			Level:    "info",
			Filename: "alemongo_logs",
		},
		SMTP: &SMTPConfig{
			Provider:  "qq",
			Host:      "smtp.qq.com",
			Port:      587,
			Username:  "1715713638@qq.com",
			Password:  "",
			FromEmail: "1715713638@qq.com",
		},
	}
}

// 初始化配置信息
func Init(filepath string) (err error) {
	if filepath == "" {
		log.Println("未设置运行配置，可创建文件 config.yaml 进行调整")
		// 默认配置
		setDefaults()
		return nil
	} else {
		viper.SetConfigFile(filepath)
		err = viper.ReadInConfig()
		if err != nil {
			fmt.Printf("viper.ReadInConfig failed, err:%v\n", err)
			return
		}

		if err := viper.Unmarshal(Conf); err != nil {
			fmt.Printf("viper.Unmarshal failed, err:%v\n", err)
		}

		viper.WatchConfig()
		viper.OnConfigChange(func(in fsnotify.Event) {
			fmt.Printf("config file changed: %v\n", in.Name)
			if err := viper.Unmarshal(Conf); err != nil {
				fmt.Printf("viper.Unmarshal failed, err:%v\n", err)
			}
		})
		return
	}
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
	server := Conf.Server
	// 打印信息
	log.Println("http://" + server.Host + ":" + server.Port)
}
