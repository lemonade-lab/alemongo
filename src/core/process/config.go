package process

import (
	config "alemongo/src/paths"
	"log"
	"os"

	"github.com/spf13/viper"
)

type RunConfig struct {
	Port int    `mapstructure:"port" yaml:"port"`
	URL  string `mapstructure:"url" yaml:"url"`
}

// ReadBotConfig 读取机器人的配置文件
func ReadBotConfig(name string) *RunConfig {
	configPath := config.GetBotConfigPath(name)
	defaultPort := 17117 // 默认端口
	defaultConfig := &RunConfig{Port: defaultPort, URL: ""}
	_, err := os.Stat(configPath)
	if os.IsNotExist(err) {
		// 如果配置文件不存在，返回默认配置
		return defaultConfig
	}
	v := viper.New()
	v.SetConfigFile(configPath)
	if err := v.ReadInConfig(); err != nil {
		return defaultConfig
	}
	var runConfig RunConfig
	log.Println("读取机器人配置:", configPath)
	if err := v.Unmarshal(&runConfig); err != nil {
		return defaultConfig
	}
	if runConfig.Port == 0 {
		runConfig.Port = defaultPort
	}
	if runConfig.URL != "" {
		runConfig.Port = 0 // 如果 URL 不为空，端口设置为 0
	}
	return &runConfig
}
