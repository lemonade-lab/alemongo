package logic

import (
	"alemongo/src/models"
	"alemongo/src/utils"
	"bytes"
	"fmt"
	"os/exec"
	"runtime"
	"strings"
)

// FirewallStatus 获取系统防火墙状态
// 当前实现针对 macOS 的 PF（pfctl）。Linux/Windows 可在后续扩展。
func FirewallStatus() models.FirewallStatusResponse {
	osname := runtime.GOOS
	res := models.FirewallStatusResponse{OS: osname}

	// 仅在 macOS 下检查 pfctl
	if osname != "darwin" {
		res.Error = "当前仅支持 macOS（pfctl）"
		return res
	}

	if _, err := exec.LookPath("pfctl"); err != nil {
		res.PfctlInstalled = false
		res.Error = "未找到 pfctl，请确认系统支持 PF"
		return res
	}
	res.PfctlInstalled = true

	// pfctl -s info
	infoOut, _ := runCommandCapture([]string{"pfctl", "-s", "info"})
	if len(infoOut) > 2000 {
		infoOut = infoOut[:2000] + "\n..."
	}
	res.Info = infoOut

	// pfctl -sr（规则）
	rulesOut, _ := runCommandCapture([]string{"pfctl", "-sr"})
	lines := strings.Split(rulesOut, "\n")
	if len(lines) > 50 {
		rulesOut = strings.Join(lines[:50], "\n") + "\n..."
	}
	res.RulesPreview = rulesOut

	// pfctl -s all | grep 'Status: Enabled'
	allOut, _ := runCommandCapture([]string{"pfctl", "-s", "all"})
	res.PfEnabled = strings.Contains(allOut, "Status: Enabled")

	return res
}

// FirewallPlan 生成 PF 相关命令
func FirewallPlan(req models.FirewallPlanRequest) models.FirewallPlanResponse {
	osname := runtime.GOOS
	resp := models.FirewallPlanResponse{OS: osname}

	if osname != "darwin" {
		resp.Message = "当前仅支持 macOS（pfctl）"
		return resp
	}

	cmds := make([]string, 0)

	// 通用：确保使用 root 权限执行（任务中心默认 bash -lc，可在命令内加入 sudo）
	// enable/disable/reload
	switch strings.ToLower(req.Action) {
	case "enable":
		// 启用 PF
		cmds = append(cmds,
			"sudo pfctl -e",
			"sudo pfctl -f /etc/pf.conf",
		)
	case "disable":
		cmds = append(cmds, "sudo pfctl -d")
	case "reload":
		cmds = append(cmds, "sudo pfctl -f /etc/pf.conf")
	case "allow", "block":
		// 生成临时规则文件片段并加载
		proto := strings.ToLower(strings.TrimSpace(req.Protocol))
		if proto == "" {
			proto = "tcp"
		}
		if req.Port <= 0 || req.Port > 65535 {
			resp.Message = "端口无效"
			return resp
		}
		action := "pass"
		if strings.ToLower(req.Action) == "block" {
			action = "block"
		}
		comment := strings.TrimSpace(req.Comment)
		if comment != "" {
			comment = " # " + comment
		}

		// 方案1：直接追加到 /etc/pf.anchors/com.alemongo 并从 pf.conf anchor 引入
		// 为简化，采用“生成临时文件 -> 以 anchor 方式加载”的命令序列。
		anchorName := "com.alemongo"
		ruleLine := fmt.Sprintf("%s proto %s from any to any port %d%s", action, proto, req.Port, comment)
		tmpFile := "/tmp/alemongo_pf_rules.conf"
		anchorLine := fmt.Sprintf("anchor \"%s\"", anchorName)
		loadLine := fmt.Sprintf("load anchor \"%s\" from \"/etc/pf.anchors/%s\"", anchorName, anchorName)
		cmds = append(cmds,
			fmt.Sprintf("echo '%s' | sudo tee %s > /dev/null", shellEscapeSingle(ruleLine), tmpFile),
			// 尝试创建 anchors 目录与目标文件
			"sudo mkdir -p /etc/pf.anchors",
			fmt.Sprintf("sudo cp %s /etc/pf.anchors/%s", tmpFile, anchorName),
			// 确保 pf.conf 包含 anchor 引用（防止重复追加，使用 grep 判断）
			fmt.Sprintf("sudo sh -c \"grep -q '%s' /etc/pf.conf || echo '%s' >> /etc/pf.conf\"", anchorLine, anchorLine),
			fmt.Sprintf("sudo sh -c \"grep -q '%s' /etc/pf.conf || echo '%s' >> /etc/pf.conf\"", loadLine, loadLine),
			"sudo pfctl -f /etc/pf.conf",
		)
	default:
		resp.Message = "未知操作"
		return resp
	}

	// 覆盖命令
	if len(req.CommandsOverride) > 0 {
		cmds = req.CommandsOverride
	}

	resp.PlannedCommands = cmds
	return resp
}

// runCommandCapture 执行命令并返回合并输出
func runCommandCapture(args []string) (string, error) {
	if len(args) == 0 {
		return "", fmt.Errorf("no command")
	}
	cmd := utils.Command(args[0], args[1:]...)
	var buf bytes.Buffer
	cmd.Stdout = &buf
	cmd.Stderr = &buf
	_ = cmd.Run()
	return buf.String(), nil
}

// （任务创建由 API 层处理，这里不直接创建任务以避免循环依赖）

// BuildFirewallCommandsForPort helper for tests
func BuildFirewallCommandsForPort(action string, port int, protocol string, comment string) []string {
	req := models.FirewallPlanRequest{Action: action, Port: port, Protocol: protocol, Comment: comment}
	resp := FirewallPlan(req)
	return resp.PlannedCommands
}

func shellEscapeSingle(s string) string {
	// 简单转义单引号：' -> '\''
	return strings.ReplaceAll(s, "'", "'\\''")
}
