//go:build linux

package firewall

import (
	"os/exec"
	"runtime"
	"strconv"
	"strings"
)

// Linux 预实现：仅检测 nft/iptables 存在并生成规划命令，暂不直接执行系统修改。
// 后续可扩展为实际调用 nft --batch 或写入临时规则文件。

type linuxProvider struct {
	backend string
}

func newProvider() Provider { return detectLinuxBackend() }

func detectLinuxBackend() Provider {
	// 优先 nftables
	if _, err := exec.LookPath("nft"); err == nil {
		return &linuxProvider{backend: "nftables"}
	}
	// 退回 iptables
	if _, err := exec.LookPath("iptables"); err == nil {
		return &linuxProvider{backend: "iptables"}
	}
	// 未找到支持后端，返回受限 provider
	return &linuxUnsupportedProvider{backend: "nftables"}
}

// linuxUnsupportedProvider 用于在 linux 下缺失 nft/iptables 二进制时的受限返回
type linuxUnsupportedProvider struct{ backend string }

func (u *linuxUnsupportedProvider) Backend() string { return u.backend }
func (u *linuxUnsupportedProvider) Supported() bool { return false }
func (u *linuxUnsupportedProvider) Status() (*Status, error) {
	return &Status{OS: runtime.GOOS, Backend: u.backend, Supported: false, UnsupportedReason: "missing_binary", Error: "未找到 nft 或 iptables", NextActions: []string{"安装 nftables 或 iptables"}}, nil
}
func (u *linuxUnsupportedProvider) Plan(req PlanRequest) (*Plan, error) {
	return &Plan{OS: runtime.GOOS, Backend: u.backend, Supported: false, UnsupportedReason: "missing_binary", Message: "未找到 nft 或 iptables", NextActions: []string{"安装 nftables 或 iptables"}}, nil
}

func (l *linuxProvider) Backend() string { return l.backend }
func (l *linuxProvider) Supported() bool { return true }

func (l *linuxProvider) Status() (*Status, error) {
	st := &Status{OS: runtime.GOOS, Backend: l.backend, Supported: true}
	// 仅做最小探测：列出后端二进制存在即可
	st.Info = "backend=" + l.backend
	st.RulesPreview = "(preview omitted)"
	return st, nil
}

func (l *linuxProvider) Plan(req PlanRequest) (*Plan, error) {
	p := &Plan{OS: runtime.GOOS, Backend: l.backend, Supported: true}
	cmds := make([]string, 0)
	action := strings.ToLower(req.Action)
	if !IsActionSupported(action) {
		p.Message = "未知操作"
		return p, nil
	}
	switch action {
	case "allow", "block":
		if req.Port <= 0 || req.Port > 65535 {
			p.Message = "端口无效"
			return p, nil
		}
		proto := NormalizeProtocol(req.Protocol)
		p.Fingerprint = BuildRuleFingerprint(p.Backend, action, req.Port, proto, req.Comment)
		if l.backend == "nftables" {
			// 简化示例：真正实现需考虑 existing chain / table
			chain := "input"
			verb := "accept"
			if action == "block" {
				verb = "drop"
			}
			cmds = append(cmds, "sudo nft add rule inet filter "+chain+" tcp dport "+itoa(req.Port)+" counter "+verb)
		} else {
			// iptables fallback
			flag := "ACCEPT"
			if action == "block" {
				flag = "DROP"
			}
			cmds = append(cmds, "sudo iptables -A INPUT -p "+proto+" --dport "+itoa(req.Port)+" -j "+flag)
		}
	case "enable", "disable", "reload":
		// Linux 没有统一 enable/disable，留空提示
		p.Message = "该动作在 Linux 暂未提供统一抽象"
	default:
		p.Message = "未知操作"
		return p, nil
	case "list":
		if l.backend == "nftables" {
			cmds = append(cmds, "sudo nft list ruleset")
		} else {
			cmds = append(cmds, "sudo iptables -S")
		}
	case "remove":
		p.Message = "当前版本仅删除登记记录，不直接下发系统删除命令"
		if req.Fingerprint != "" {
			p.Fingerprint = req.Fingerprint
		}
	}

	if len(req.CommandsOverride) > 0 {
		cmds = req.CommandsOverride
	}
	p.PlannedCommands = cmds
	return p, nil
}

// itoa: 避免引入 strconv 轻量包装（便于最小 diff）
func itoa(i int) string { return strconv.Itoa(i) }
