package settings

import (
	"fmt"
	"log"
	"os"
	"path"
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

// 获取机器人模板目录
func GetBotTemplate() string {
	return path.Join("resources")
}

// 获取工作目录
func GetWorkPath() string {
	return path.Join("work")
}

// 用户数据目录
func GetUserDataPath() (string, error) {
	userDataPath := path.Join(GetWorkPath(), "users")
	// 如果目录不存在，则创建
	if err := os.MkdirAll(userDataPath, 0755); err != nil {
		log.Printf("创建用户数据目录失败: %v", err)
		return "", err
	}
	return userDataPath, nil
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

//func (app *AppConfig) MarshalYAML() (interface{}, error) {
//	addQuotes := func(value string) string {
//		log.Println(value)
//		if value == "" {
//			return value
//		}
//		if value[0] == '"' && value[len(value)-1] == '"' {
//			return value
//		}
//		return fmt.Sprintf(`"%s"`, value)
//	}
//	return AppConfig{
//		Name: addQuotes(app.Name),
//		Mode: addQuotes(app.Mode),
//		Server: &ServerConfig{
//			Host: addQuotes(app.Server.Host),
//			Port: addQuotes(app.Server.Port),
//			TokenConfig: &TokenConfig{
//				Key:         addQuotes(app.Server.TokenConfig.Key),
//				ExpiresTime: app.Server.TokenConfig.ExpiresTime,
//			},
//		},
//		Log: &LogConfig{
//			Level:    addQuotes(app.Log.Level),
//			Filename: addQuotes(app.Log.Filename),
//		},
//
//		SMTP: &SMTPConfig{
//			Provider:  addQuotes(app.SMTP.Provider),
//			Host:      addQuotes(app.SMTP.Host),
//			Port:      app.SMTP.Port,
//			Username:  addQuotes(app.SMTP.Username),
//			Password:  addQuotes(app.SMTP.Password),
//			FromEmail: addQuotes(app.SMTP.FromEmail),
//		},
//	}, nil
//}

//func (app *AppConfig) MarshalYAML() (interface{}, error) {
//	return map[string]interface{}{
//		"name": app.Name,
//		"mode": app.Mode,
//		"server": map[string]interface{}{
//			"host": app.Server.Host,
//			"port": app.Server.Port,
//			"tokenconfig": map[string]interface{}{
//				"key":          app.Server.TokenConfig.Key,
//				"expires_time": app.Server.TokenConfig.ExpiresTime,
//			},
//		},
//		"log": map[string]interface{}{
//			"level":    app.Log.Level,
//			"filename": app.Log.Filename,
//		},
//		"smtp": map[string]interface{}{
//			"provider":   app.SMTP.Provider,
//			"host":       app.SMTP.Host,
//			"port":       app.SMTP.Port,
//			"username":   app.SMTP.Username,
//			"password":   app.SMTP.Password,
//			"from_email": app.SMTP.FromEmail,
//		},
//	}, nil
//}
