package settings

import (
	"log"
	"os"
	"strconv"
	"time"
)

const (
	ServiceName        = "alemongo"
	ServiceDescription = "web service"
)

var Conf = new(AppConfig)

type AppConfig struct {
	Name    string          `json:"name"`
	Mode    string          `json:"mode"`
	Server  *ServerConfig   `json:"server"`
	Session *SessionConfig  `json:"session"`
	Log     *LogConfig      `json:"log"`
	SMTP    *SMTPConfig     `json:"smtp"`
	GitHub  *GitHubConfig   `json:"github"`
	DB      *DatabaseConfig `json:"database"`
}

type ServerConfig struct {
	Host string `json:"host"`
	Port string `json:"port"`
}

// SessionConfig 会话配置
type SessionConfig struct {
	ExpiresDays int64 `json:"expires_days"`
}

type LogConfig struct {
	Level    string `json:"level"`
	Filename string `json:"filename"`
}

// SMTPConfig 邮件服务配置
type SMTPConfig struct {
	Provider  string `json:"provider"`
	Host      string `json:"host"`
	Port      int64  `json:"port"`
	Username  string `json:"username"`
	Password  string `json:"password"`
	FromEmail string `json:"from_email"`
}

// GitHubConfig GitHub OAuth 配置
type GitHubConfig struct {
	ClientID     string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
	RedirectURL  string `json:"redirect_url"`
}

// DatabaseConfig 数据库配置
// driver: sqlite | mysql | postgres
// sqlite 使用 SQLitePath 字段；mysql/postgres 使用 DSN
type DatabaseConfig struct {
	Driver      string `json:"driver"`
	DSN         string `json:"dsn"`
	SQLitePath  string `json:"sqlite_path"`
	AutoMigrate bool   `json:"auto_migrate"`
}

// Init 初始化配置 - 从环境变量加载所有配置
func Init() error {
	log.Println("=== Alemongo 配置初始化 ===")

	// 基础配置
	Conf.Name = getEnv("ALEMONGO_NAME", ServiceName)
	Conf.Mode = getEnv("ALEMONGO_MODE", "release")

	// 服务器配置
	Conf.Server = &ServerConfig{
		Host: getEnv("ALEMONGO_SERVER_HOST", "127.0.0.1"),
		Port: getEnv("ALEMONGO_SERVER_PORT", "17187"),
	}

	// 会话配置
	Conf.Session = &SessionConfig{
		ExpiresDays: getEnvAsInt64("ALEMONGO_SESSION_EXPIRES_DAYS", 30),
	}

	// 日志配置
	Conf.Log = &LogConfig{
		Level:    getEnv("ALEMONGO_LOG_LEVEL", "info"),
		Filename: getEnv("ALEMONGO_LOG_FILENAME", "work/logs"),
	}

	// SMTP 配置
	Conf.SMTP = &SMTPConfig{
		Provider:  getEnv("ALEMONGO_SMTP_PROVIDER", "qq"),
		Host:      getEnv("ALEMONGO_SMTP_HOST", "smtp.qq.com"),
		Port:      getEnvAsInt64("ALEMONGO_SMTP_PORT", 587),
		Username:  getEnv("ALEMONGO_SMTP_USERNAME", ""),
		Password:  getEnv("ALEMONGO_SMTP_PASSWORD", ""),
		FromEmail: getEnv("ALEMONGO_SMTP_FROM_EMAIL", ""),
	}

	// GitHub OAuth 配置
	Conf.GitHub = &GitHubConfig{
		ClientID:     getEnv("ALEMONGO_GITHUB_CLIENT_ID", ""),
		ClientSecret: getEnv("ALEMONGO_GITHUB_CLIENT_SECRET", ""),
		RedirectURL:  getEnv("ALEMONGO_GITHUB_REDIRECT_URL", ""),
	}

	// 数据库配置
	Conf.DB = &DatabaseConfig{
		Driver:      getEnv("ALEMONGO_DB_DRIVER", "sqlite"),
		DSN:         getEnv("ALEMONGO_DB_DSN", ""),
		SQLitePath:  getEnv("ALEMONGO_DB_SQLITE_PATH", "work/data/alemongo.db"),
		AutoMigrate: getEnvAsBool("ALEMONGO_DB_AUTO_MIGRATE", true),
	}

	// 打印配置摘要（不显示敏感信息）
	log.Printf("应用名称: %s", Conf.Name)
	log.Printf("运行模式: %s", Conf.Mode)
	log.Printf("服务地址: %s:%s", Conf.Server.Host, Conf.Server.Port)
	log.Printf("数据库驱动: %s", Conf.DB.Driver)
	log.Printf("日志级别: %s", Conf.Log.Level)

	if Conf.GitHub.ClientID != "" {
		log.Println("GitHub OAuth: 已配置")
	}
	if Conf.SMTP.Username != "" {
		log.Println("SMTP 邮件: 已配置")
	}

	log.Println("=== 配置加载完成 ===")
	return nil
}

// FillDefaultsIfNeeded 供外部在极早期调用确保默认 DB/sqlite 就绪
func FillDefaultsIfNeeded() {
	if Conf == nil {
		Conf = &AppConfig{}
	}
	if Conf.DB == nil {
		Conf.DB = &DatabaseConfig{
			Driver:      getEnv("ALEMONGO_DB_DRIVER", "sqlite"),
			SQLitePath:  getEnv("ALEMONGO_DB_SQLITE_PATH", "work/data/alemongo.db"),
			AutoMigrate: getEnvAsBool("ALEMONGO_DB_AUTO_MIGRATE", true),
		}
	}
}

// 获取环境变量，如果不存在则返回默认值
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// 获取环境变量并转换为 int64
func getEnvAsInt64(key string, defaultValue int64) int64 {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.ParseInt(valueStr, 10, 64)
	if err != nil {
		log.Printf("环境变量 %s 解析为 int64 失败，使用默认值 %d: %v\n", key, defaultValue, err)
		return defaultValue
	}
	return value
}

// 获取环境变量并转换为 bool
func getEnvAsBool(key string, defaultValue bool) bool {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.ParseBool(valueStr)
	if err != nil {
		log.Printf("环境变量 %s 解析为 bool 失败，使用默认值 %v: %v\n", key, defaultValue, err)
		return defaultValue
	}
	return value
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
