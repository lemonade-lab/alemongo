package autoregister

import (
	"alemongo/src/config"
	"alemongo/src/utils"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
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
func RegisterIfNeeded(serviceName, description string) error {
	// 获取当前程序的绝对路径
	execPath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("获取可执行文件路径失败: %w", err)
	}
	// 根据操作系统选择注册逻辑
	switch runtime.GOOS {
	case "linux":
		return registerLinux(serviceName, description, execPath)
	case "darwin":
		return registerMacOS(serviceName, description, execPath)
	case "windows":
		return registerWindows(serviceName, execPath)
	default:
		return fmt.Errorf("当前操作系统: %s, 不支持注册系统服务", runtime.GOOS)
	}
}

func logCmd() {
	// 提示用户启用和启动服务
	log.Printf("要启动服务，请运行: systemctl start %s", config.ServiceName)
	log.Printf("要停止服务，请运行: systemctl stop %s", config.ServiceName)
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

	if err := createServiceFileLinux(config); err != nil {
		return fmt.Errorf("创建 Linux 服务文件失败: %w", err)
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

// createServiceFileLinux 创建 systemd 服务文件
func createServiceFileLinux(config ServiceConfig) error {
	// 获取当前环境变量中的 PATH
	pathEnv := os.Getenv("PATH")
	// 获取当前用户的 HOME 目录
	homeDir, err := os.UserHomeDir()

	// 如果出现错误。默认使用 /root 目录
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
	file, err := os.OpenFile(serviceFilePath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		log.Printf("创建服务文件失败: %v", err)
		return fmt.Errorf("创建服务文件失败: %w", err)
	}
	defer file.Close()

	tmpl, err := template.New("systemdService").Parse(serviceTemplate)
	if err != nil {
		log.Printf("解析服务模板失败: %v", err)
		return fmt.Errorf("解析服务模板失败: %w", err)
	}
	if err := tmpl.Execute(file, configData); err != nil {
		log.Printf("写入服务文件失败: %v", err)
		return fmt.Errorf("写入服务文件失败: %w", err)
	}
	log.Printf("服务文件已创建: %s\n", serviceFilePath)
	return nil
}

// macOS 注册逻辑
func registerMacOS(serviceName, description, execPath string) error {
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
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
`
	plistPath := fmt.Sprintf("%s/Library/LaunchAgents/%s.plist", os.Getenv("HOME"), serviceName)
	file, err := os.OpenFile(plistPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		return fmt.Errorf("创建 plist 文件失败: %w", err)
	}
	defer file.Close()

	tmpl, err := template.New("launchdPlist").Parse(plistTemplate)
	if err != nil {
		return fmt.Errorf("解析 plist 模板失败: %w", err)
	}
	config := ServiceConfig{
		ServiceName: serviceName,
		Description: description,
		ExecPath:    execPath,
	}
	if err := tmpl.Execute(file, config); err != nil {
		return fmt.Errorf("写入 plist 文件失败: %w", err)
	}
	log.Printf("已创建系统服务,若后台挂载请运行:\nlaunchctl load %s ", plistPath)
	log.Printf("若卸载服务，请运行:\nlaunchctl unload %s", plistPath)
	return nil
}

// Windows 注册逻辑
func registerWindows(serviceName, execPath string) error {
	cmd := utils.Command("sc", "create", serviceName, "binPath=", execPath, "start=", "auto")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("在 Windows 上创建服务失败: %w", err)
	}
	// 提示注册成功。告知启动服务的命令和停止服务的命令
	log.Printf("服务 %s 已在 Windows 上注册。\n", serviceName)
	log.Printf("要启动服务，请运行:\n sc start %s", serviceName)
	log.Printf("要停止服务，请运行:\n sc stop %s", serviceName)
	log.Printf("要删除服务，请运行:\n sc delete %s", serviceName)
	return nil
}
