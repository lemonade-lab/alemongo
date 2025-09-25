//go:build windows

package firewall

import (
	"runtime"
	"strconv"
	"strings"
)

// Windows 预实现：仅生成 netsh 命令规划，不直接执行。
// 后续可扩展 PowerShell (Set-NetFirewallRule / New-NetFirewallRule) 精细控制。

type windowsProvider struct{}

func newProvider() Provider { return &windowsProvider{} }

func (w *windowsProvider) Backend() string { return "netsh" }
func (w *windowsProvider) Supported() bool { return true }

func (w *windowsProvider) Status() (*Status, error) {
	return &Status{OS: runtime.GOOS, Backend: w.Backend(), Supported: true, Info: "using Windows netsh backend", RulesPreview: "(preview omitted)"}, nil
}

func (w *windowsProvider) Plan(req PlanRequest) (*Plan, error) {
	p := &Plan{OS: runtime.GOOS, Backend: w.Backend(), Supported: true}
	cmds := make([]string, 0)
	act := strings.ToLower(req.Action)
	if !IsActionSupported(act) {
		p.Message = "未知操作"
		return p, nil
	}
	switch act {
	case "allow", "block":
		if req.Port <= 0 || req.Port > 65535 {
			p.Message = "端口无效"
			return p, nil
		}
		proto := strings.ToUpper(NormalizeProtocol(req.Protocol))
		name := "alemongo_rule_" + proto + "_" + itoa(req.Port)
		p.Fingerprint = BuildRuleFingerprint(p.Backend, act, req.Port, proto, req.Comment)
		if act == "allow" {
			cmds = append(cmds, "netsh advfirewall firewall add rule name="+name+" dir=in action=allow protocol="+proto+" localport="+itoa(req.Port))
		} else {
			// Windows 阻断可通过设置 action=block
			cmds = append(cmds, "netsh advfirewall firewall add rule name="+name+" dir=in action=block protocol="+proto+" localport="+itoa(req.Port))
		}
	case "enable", "disable":
		// Windows 全局启停防火墙（示例：Domain 配置，可扩展添加 Private/Public）
		if act == "enable" {
			cmds = append(cmds, "netsh advfirewall set allprofiles state on")
		} else {
			cmds = append(cmds, "netsh advfirewall set allprofiles state off")
		}
	case "reload":
		p.Message = "Windows 暂无 reload 抽象"
	case "list":
		cmds = append(cmds, "netsh advfirewall firewall show rule name=all")
	case "remove":
		p.Message = "当前版本仅删除登记记录，不直接移除系统规则"
		if req.Fingerprint != "" {
			p.Fingerprint = req.Fingerprint
		}
	default:
		p.Message = "未知操作"
		return p, nil
	}
	if len(req.CommandsOverride) > 0 {
		cmds = req.CommandsOverride
	}
	p.PlannedCommands = cmds
	return p, nil
}

// 局部 itoa，避免与其它文件冲突
func itoa(i int) string { return strconv.Itoa(i) }
