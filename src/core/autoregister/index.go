package autoregister

import (
	"fmt"
	"log"
	"os"
	"os/exec"
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
		return fmt.Errorf("不支持的操作系统: %s", runtime.GOOS)
	}
}

// Linux 注册逻辑
func registerLinux(serviceName, description, execPath string) error {
	if checkIfRegisteredLinux(serviceName) {
		log.Printf("服务 %s 已在 Linux 上注册。\n", serviceName)
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

	if err := enableAndStartServiceLinux(serviceName); err != nil {
		return fmt.Errorf("启用/启动 Linux 服务失败: %w", err)
	}

	return nil
}

// checkIfRegisteredLinux 检查服务是否已注册
func checkIfRegisteredLinux(serviceName string) bool {
	cmd := exec.Command("systemctl", "is-enabled", serviceName)
	err := cmd.Run()
	return err == nil
}

// createServiceFileLinux 创建 systemd 服务文件
func createServiceFileLinux(config ServiceConfig) error {
	// 获取当前环境变量中的 PATH
	pathEnv := os.Getenv("PATH")
	serviceTemplate := `[Unit]
Description={{.Description}}
After=network.target

[Service]
Type=simple
ExecStart={{.ExecPath}}
WorkingDirectory={{.WorkingDir}}
Environment="PATH={{.PathEnv}}"
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
	}
	configData := LinuxServiceConfig{
		ServiceName: config.ServiceName,
		Description: config.Description,
		ExecPath:    config.ExecPath,
		WorkingDir:  config.WorkingDir,
		PathEnv:     pathEnv,
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

// enableAndStartServiceLinux 启用并启动服务
func enableAndStartServiceLinux(serviceName string) error {
	if err := exec.Command("systemctl", "enable", serviceName).Run(); err != nil {
		return fmt.Errorf("启用服务失败: %w", err)
	}
	if err := exec.Command("systemctl", "start", serviceName).Run(); err != nil {
		return fmt.Errorf("启动服务失败: %w", err)
	}
	log.Printf("服务 %s 已成功在 Linux 上启用并启动。\n", serviceName)
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

	if err := exec.Command("launchctl", "load", plistPath).Run(); err != nil {
		return fmt.Errorf("加载 plist 文件失败: %w", err)
	}

	log.Printf("服务 %s 已成功在 macOS 上注册并加载。\n", serviceName)
	return nil
}

// Windows 注册逻辑
func registerWindows(serviceName, execPath string) error {
	cmd := exec.Command("sc", "create", serviceName, "binPath=", execPath, "start=", "auto")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("在 Windows 上创建服务失败: %w", err)
	}

	cmd = exec.Command("sc", "start", serviceName)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("在 Windows 上启动服务失败: %w", err)
	}

	log.Printf("服务 %s 已成功在 Windows 上注册并启动。\n", serviceName)
	return nil
}
