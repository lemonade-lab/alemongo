package logic

import (
	config "alemongo/src/paths"

	"github.com/spf13/viper"
)

type RunConfig struct {
	Port int    `mapstructure:"port" yaml:"port"`
	URL  string `mapstructure:"url" yaml:"url"`
}

// ReadBotConfig 读取机器人的配置文件
func ReadBotConfig(name string) *RunConfig {
	configPath := config.GetBotConfigPath(name)
	initProt := 17117 // 默认端口
	initConfig := &RunConfig{Port: initProt, URL: ""}
	if !config.Exists(configPath) {
		// 如果配置文件不存在，返回。端口默认为 17117
		return initConfig
	}
	var runConfig RunConfig
	viper.SetConfigFile(configPath)
	if err := viper.ReadInConfig(); err != nil {
		return initConfig
	}
	if err := viper.Unmarshal(&runConfig); err != nil {
		return initConfig
	}
	if runConfig.Port == 0 {
		runConfig.Port = initProt
	}
	return &runConfig
}
