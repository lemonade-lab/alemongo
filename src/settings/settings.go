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

// 补全所有字段默认值
func fillDefaults() {
	if Conf == nil {
		Conf = &AppConfig{}
	}
	if Conf.Name == "" {
		Conf.Name = ServiceName
	}
	if Conf.Mode == "" {
		Conf.Mode = "release"
	}
	if Conf.Server == nil {
		Conf.Server = &ServerConfig{}
	}
	if Conf.Server.Host == "" {
		Conf.Server.Host = "127.0.0.1"
	}
	if Conf.Server.Port == "" {
		Conf.Server.Port = "17187"
	}
	if Conf.Server.TokenConfig == nil {
		Conf.Server.TokenConfig = &TokenConfig{}
	}
	if Conf.Server.TokenConfig.Key == "" {
		Conf.Server.TokenConfig.Key = "alemongo"
	}
	if Conf.Server.TokenConfig.ExpiresTime == 0 {
		Conf.Server.TokenConfig.ExpiresTime = 24
	}
	if Conf.Log == nil {
		Conf.Log = &LogConfig{}
	}
	if Conf.Log.Level == "" {
		Conf.Log.Level = "info"
	}
	if Conf.Log.Filename == "" {
		Conf.Log.Filename = "alemongo_logs"
	}
	if Conf.SMTP == nil {
		Conf.SMTP = &SMTPConfig{}
	}
	if Conf.SMTP.Provider == "" {
		Conf.SMTP.Provider = "qq"
	}
	if Conf.SMTP.Host == "" {
		Conf.SMTP.Host = "smtp.qq.com"
	}
	if Conf.SMTP.Port == 0 {
		Conf.SMTP.Port = 587
	}
	if Conf.SMTP.Username == "" {
		Conf.SMTP.Username = ""
	}
	if Conf.SMTP.Password == "" {
		Conf.SMTP.Password = ""
	}
	if Conf.SMTP.FromEmail == "" {
		Conf.SMTP.FromEmail = ""
	}
}

// 初始化配置信息
func Init(filepath string) (err error) {
	if filepath == "" {
		Conf = &AppConfig{} // 保证 fillDefaults 可用
		fillDefaults()
		return nil
	}
	viper.SetConfigFile(filepath)
	err = viper.ReadInConfig()
	if err != nil {
		fmt.Printf("viper.ReadInConfig failed, err:%v\n", err)
		Conf = &AppConfig{}
		fillDefaults()
		return nil
	}

	if err := viper.Unmarshal(Conf); err != nil {
		fmt.Printf("viper.Unmarshal failed, err:%v\n", err)
	}
	fillDefaults()

	viper.WatchConfig()
	viper.OnConfigChange(func(in fsnotify.Event) {
		fmt.Printf("config file changed: %v\n", in.Name)
		if err := viper.Unmarshal(Conf); err != nil {
			fmt.Printf("viper.Unmarshal failed, err:%v\n", err)
		}
		fillDefaults()
	})
	return nil
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
