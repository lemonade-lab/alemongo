package settings

import (
	"fmt"
	"log"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
)

const (
	ServiceName        = "alemongo"
	ServiceDescription = "web service"
)

var Conf = new(AppConfig)

type AppConfig struct {
	Name   string        `mapstructure:"name" yaml:"name"`
	Mode   string        `mapstructure:"mode" yaml:"mode"`
	Server *ServerConfig `mapstructure:"server" yaml:"server"`
	Log    *LogConfig    `mapstructure:"log" yaml:"log"`
	SMTP   *SMTPConfig   `mapstructure:"smtp" yaml:"smtp"`
}

type ServerConfig struct {
	Host         string `mapstructure:"host" yaml:"host"`
	Port         string `mapstructure:"port" yaml:"port"`
	*TokenConfig `mapstructure:"token" yaml:"token"`
}

type TokenConfig struct {
	Key         string `mapstructure:"key" yaml:"key"`
	ExpiresTime int64  `mapstructure:"expires_time" yaml:"expires_time"`
}

type LogConfig struct {
	Level    string `mapstructure:"level" yaml:"level"`
	Filename string `mapstructure:"filename" yaml:"filename"`
}

// 邮件服务的config
type SMTPConfig struct {
	Provider  string `mapstructure:"provider" yaml:"provider"`
	Host      string `mapstructure:"host" yaml:"host"`
	Port      int64  `mapstructure:"port" yaml:"port"`
	Username  string `mapstructure:"username" yaml:"username"`
	Password  string `mapstructure:"password" yaml:"password"`
	FromEmail string `mapstructure:"from_email" yaml:"from_email"`
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
				ExpiresTime: 24,
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
			Username:  "",
			Password:  "",
			FromEmail: "",
		},
	}
}

// 初始化配置信息
func Init(filepath string) (err error) {
	if filepath == "" {
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

var Version string
var BuildTime string

func SetBaseInfo(version, buildTime string) {
	Version = version
	BuildTime = buildTime
	// 输出当前版本号
	log.Println("Version: ", Version, "(", BuildTime, ")")
}

type BaseInfo struct {
	Version   string `json:"version"`    // 版本号
	BuildTime string `json:"build_time"` // 构建时间
}

func GetBaseInfo() BaseInfo {
	return BaseInfo{
		Version:   Version,
		BuildTime: BuildTime,
	}
}
