package autoregister

import (
	"alemongo/src/settings"
	"alemongo/src/utils"
	"bytes"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"text/template"
)

// ServiceConfig 定义服务的配置结构
type ServiceConfig struct {
	ServiceName string // 服务名称
	Description string // 服务描述
	ExecPath    string // 当前可执行程序路径
	WorkingDir  string // 工作目录
}

// RegisterIfNeeded 检查服务是否已注册，如果未注册则自动注册
func RegisterIfNeeded(serviceName, description string) {
	// 获取当前程序的绝对路径
	execPath, err := os.Executable()
	if err != nil {
		log.Printf("获取可执行文件路径失败: %v", err)
	}
	// 根据操作系统选择注册逻辑
	switch runtime.GOOS {
	case "linux":
		if err := registerLinux(serviceName, description, execPath); err != nil {
			log.Printf("Linux 服务注册失败: %v", err)
		}
		return
	case "darwin":
		if err := registerMacOS(serviceName, description, execPath); err != nil {
			log.Printf("macOS 服务注册失败: %v", err)
		}
	default:
		// 不注册服务。
	}
}

func logCmd() {
	// 提示用户启用和启动服务
	log.Printf("要启动服务，请运行: systemctl start %s", settings.ServiceName)
	log.Printf("要停止服务，请运行: systemctl stop %s", settings.ServiceName)
}

// Linux 注册逻辑
func registerLinux(serviceName, description, execPath string) error {
	if checkIfRegisteredLinux(serviceName) {
		logCmd()
		return nil
	}

	workingDir := filepath.Dir(execPath)
	config := ServiceConfig{
		ServiceName: serviceName,
		Description: description,
		ExecPath:    execPath,
		WorkingDir:  workingDir,
	}

	changed, err := createOrUpdateServiceFileLinux(config)
	if err != nil {
		return fmt.Errorf("创建或更新 Linux 服务文件失败: %w", err)
	}

	if changed {
		// 自动刷新 systemd 配置
		if err := utils.Command("systemctl", "daemon-reload").Run(); err != nil {
			log.Printf("自动执行 systemctl daemon-reload 失败: %v", err)
		}
		log.Printf("服务文件已创建/更新并 reload: /etc/systemd/system/%s.service", config.ServiceName)
	} else {
		log.Printf("服务文件未变更，无需更新: /etc/systemd/system/%s.service", config.ServiceName)
	}

	logCmd()
	return nil
}

// checkIfRegisteredLinux 检查服务是否已注册
func checkIfRegisteredLinux(serviceName string) bool {
	cmd := utils.Command("systemctl", "is-enabled", serviceName)
	err := cmd.Run()
	return err == nil
}

// createOrUpdateServiceFileLinux 创建或更新 systemd 服务文件，仅在内容变化时写入并 reload
func createOrUpdateServiceFileLinux(config ServiceConfig) (changed bool, err error) {
	// 获取当前环境变量中的 PATH
	pathEnv := os.Getenv("PATH")
	// 获取当前用户的 HOME 目录
	homeDir, err := os.UserHomeDir()
	if err != nil {
		homeDir = "/root"
	}
	// 获取当前 Shell
	shell := os.Getenv("SHELL")
	if shell == "" {
		shell = "/bin/bash"
	}

	serviceTemplate := `[Unit]
Description={{.Description}}
After=network.target

[Service]
Type=simple
ExecStart={{.ExecPath}}
WorkingDirectory={{.WorkingDir}}
Environment="PATH={{.PathEnv}}"
Environment="HOME={{.HomeDir}}"
Environment="SHELL={{.Shell}}"
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
`
	// 扩展 ServiceConfig 结构体用于模板
	type LinuxServiceConfig struct {
		ServiceName string
		Description string
		ExecPath    string
		WorkingDir  string
		PathEnv     string
		HomeDir     string
		Shell       string
	}
	configData := LinuxServiceConfig{
		ServiceName: config.ServiceName,
		Description: config.Description,
		ExecPath:    config.ExecPath,
		WorkingDir:  config.WorkingDir,
		PathEnv:     pathEnv,
		HomeDir:     homeDir,
		Shell:       shell,
	}

	serviceFilePath := fmt.Sprintf("/etc/systemd/system/%s.service", config.ServiceName)

	// 渲染新内容到 buffer
	var buf bytes.Buffer
	tmpl, err := template.New("systemdService").Parse(serviceTemplate)
	if err != nil {
		return false, fmt.Errorf("解析服务模板失败: %w", err)
	}
	if err := tmpl.Execute(&buf, configData); err != nil {
		return false, fmt.Errorf("渲染服务模板失败: %w", err)
	}
	newContent := buf.Bytes()

	// 如果文件已存在，读取并对比内容
	existing, err := os.ReadFile(serviceFilePath)
	if err == nil {
		if bytes.Equal(existing, newContent) {
			// 内容未变
			return false, nil
		}
	}

	// 内容不同或文件不存在，写入新内容
	file, err := os.OpenFile(serviceFilePath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		return false, fmt.Errorf("创建服务文件失败: %w", err)
	}
	defer file.Close()

	if _, err := io.Copy(file, bytes.NewReader(newContent)); err != nil {
		return false, fmt.Errorf("写入服务文件失败: %w", err)
	}
	return true, nil
}

// macOS 注册逻辑
func registerMacOS(serviceName, description, execPath string) error {
	// 检查服务是否已经加载
	if checkIfRegisteredMacOS(serviceName) {
		log.Printf("服务 %s 已经注册并加载", serviceName)
		return nil
	}

	workingDir := filepath.Dir(execPath)
	plistTemplate := `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>{{.ServiceName}}</string>
    <key>ProgramArguments</key>
    <array>
        <string>{{.ExecPath}}</string>
    </array>
    <key>WorkingDirectory</key>
    <string>{{.WorkingDir}}</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>{{.LogPath}}</string>
    <key>StandardErrorPath</key>
    <string>{{.LogPath}}</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>{{.PathEnv}}</string>
        <key>HOME</key>
        <string>{{.HomeDir}}</string>
    </dict>
</dict>
</plist>
`
	plistPath := fmt.Sprintf("%s/Library/LaunchAgents/%s.plist", os.Getenv("HOME"), serviceName)

	// 获取环境变量
	pathEnv := os.Getenv("PATH")
	homeDir, err := os.UserHomeDir()
	if err != nil {
		homeDir = "/Users/root"
	}

	// 日志文件路径
	logPath := fmt.Sprintf("%s/Library/Logs/%s.log", os.Getenv("HOME"), serviceName)

	// 扩展 ServiceConfig 结构体用于模板
	type MacOSServiceConfig struct {
		ServiceName string
		Description string
		ExecPath    string
		WorkingDir  string
		PathEnv     string
		HomeDir     string
		LogPath     string
	}

	config := MacOSServiceConfig{
		ServiceName: serviceName,
		Description: description,
		ExecPath:    execPath,
		WorkingDir:  workingDir,
		PathEnv:     pathEnv,
		HomeDir:     homeDir,
		LogPath:     logPath,
	}

	// 渲染新内容到 buffer
	var buf bytes.Buffer
	tmpl, err := template.New("launchdPlist").Parse(plistTemplate)
	if err != nil {
		return fmt.Errorf("解析 plist 模板失败: %w", err)
	}
	if err := tmpl.Execute(&buf, config); err != nil {
		return fmt.Errorf("渲染 plist 模板失败: %w", err)
	}
	newContent := buf.Bytes()

	// 如果文件已存在，对比内容
	existing, err := os.ReadFile(plistPath)
	if err == nil {
		if bytes.Equal(existing, newContent) {
			// 内容未变，但可能未加载
			log.Printf("plist 文件已存在且内容未变: %s", plistPath)
		} else {
			// 内容不同，需要重新加载
			log.Printf("plist 文件内容已更新，需要重新加载")
		}
	}

	// 确保目录存在
	plistDir := filepath.Dir(plistPath)
	if err := os.MkdirAll(plistDir, 0755); err != nil {
		return fmt.Errorf("创建 plist 目录失败: %w", err)
	}

	// 内容不同或文件不存在，写入新内容
	file, err := os.OpenFile(plistPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		return fmt.Errorf("创建 plist 文件失败: %w", err)
	}
	defer file.Close()
	if _, err := io.Copy(file, bytes.NewReader(newContent)); err != nil {
		return fmt.Errorf("写入 plist 文件失败: %w", err)
	}

	// 尝试自动加载服务
	if err := loadMacOSService(plistPath); err != nil {
		log.Printf("自动加载服务失败: %v", err)
		log.Printf("请手动运行: launchctl load %s", plistPath)
	} else {
		log.Printf("服务已成功加载: %s", serviceName)
	}

	log.Printf("已创建/更新系统服务: %s", plistPath)
	log.Printf("若卸载服务，请运行:\nlaunchctl unload %s", plistPath)
	return nil
}

// checkIfRegisteredMacOS 检查 macOS 服务是否已注册并加载
func checkIfRegisteredMacOS(serviceName string) bool {
	// 检查 launchctl 列表中是否包含该服务
	cmd := utils.Command("launchctl", "list")
	output, err := cmd.Output()
	if err != nil {
		return false
	}

	// 检查输出中是否包含服务名称
	return strings.Contains(string(output), serviceName)
}

// loadMacOSService 加载 macOS 服务
func loadMacOSService(plistPath string) error {
	// 先尝试卸载（如果已存在）
	unloadCmd := utils.Command("launchctl", "unload", plistPath)
	unloadCmd.Run() // 忽略错误，因为可能服务本来就没加载

	// 加载服务
	loadCmd := utils.Command("launchctl", "load", plistPath)
	return loadCmd.Run()
}
