package config

type Server struct {
	Host string `yaml:"host"`
	Port string `yaml:"port"`
	Key  string `yaml:"key"`
}

type Config struct {
	Server Server `yaml:"server"`
}
