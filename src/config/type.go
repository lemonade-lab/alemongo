package config

import "time"

type Token struct {
	Key         string        `yaml:"key"`
	ExpiresTime time.Duration `yaml:"expires_time"`
}

type Server struct {
	Host  string `yaml:"host"`
	Port  string `yaml:"port"`
	Token Token  `yaml:"token"`
}

type Config struct {
	Server Server `yaml:"server"`
}
