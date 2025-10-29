//go:build darwin

package firewall

import (
	"alemongo/src/utils"
	"bytes"
	"fmt"
	"os/exec"
	"runtime"
	"strings"
)

// macOS pfctl 实现
type pfProvider struct{}

func newProvider() Provider { return &pfProvider{} }

func (p *pfProvider) Backend() string { return "pfctl" }
func (p *pfProvider) Supported() bool { return true }

func (p *pfProvider) Status() (*Status, error) {
	s := &Status{OS: runtime.GOOS, Backend: p.Backend(), Supported: true}

	if _, err := exec.LookPath("pfctl"); err != nil {
		s.PfctlInstalled = false
		s.Error = "未找到 pfctl"
		s.UnsupportedReason = "missing_binary"
		s.NextActions = []string{"安装或启用 macOS PF", "确认 /sbin/pfctl 可用"}
		return s, nil
	}
	s.PfctlInstalled = true

	// pfctl -s info
	infoOut, _ := runCapture([]string{"pfctl", "-s", "info"})
	if len(infoOut) > 2000 {
		infoOut = infoOut[:2000] + "\n..."
	}
	s.Info = infoOut

	// pfctl -sr
	rulesOut, _ := runCapture([]string{"pfctl", "-sr"})
	lines := strings.Split(rulesOut, "\n")
	if len(lines) > 50 {
		rulesOut = strings.Join(lines[:50], "\n") + "\n..."
	}
	s.RulesPreview = rulesOut

	allOut, _ := runCapture([]string{"pfctl", "-s", "all"})
	s.PfEnabled = strings.Contains(allOut, "Status: Enabled")
	return s, nil
}

func (p *pfProvider) Plan(req PlanRequest) (*Plan, error) {
	resp := &Plan{OS: runtime.GOOS, Backend: p.Backend(), Supported: true}
	cmds := make([]string, 0)

	switch strings.ToLower(req.Action) {
	case "enable":
		cmds = append(cmds, "sudo pfctl -e", "sudo pfctl -f /etc/pf.conf")
	case "disable":
		cmds = append(cmds, "sudo pfctl -d")
	case "reload":
		cmds = append(cmds, "sudo pfctl -f /etc/pf.conf")
	case "allow", "block":
		proto := NormalizeProtocol(req.Protocol)
		if req.Port <= 0 || req.Port > 65535 {
			resp.Message = "端口无效"
			return resp, nil
		}
		action := "pass"
		if strings.ToLower(req.Action) == "block" {
			action = "block"
		}
		comment := SanitizeComment(req.Comment)
		if comment != "" {
			comment = " # " + comment
		}
		resp.Fingerprint = BuildRuleFingerprint(resp.Backend, strings.ToLower(req.Action), req.Port, proto, req.Comment)

		anchorName := "com.alemongo"
		ruleLine := fmt.Sprintf("%s proto %s from any to any port %d%s", action, proto, req.Port, comment)
		tmpFile := "/tmp/alemongo_pf_rules.conf"
		anchorLine := fmt.Sprintf("anchor \"%s\"", anchorName)
		loadLine := fmt.Sprintf("load anchor \"%s\" from \"/etc/pf.anchors/%s\"", anchorName, anchorName)
		cmds = append(cmds,
			fmt.Sprintf("echo '%s' | sudo tee %s > /dev/null", escSingle(ruleLine), tmpFile),
			"sudo mkdir -p /etc/pf.anchors",
			fmt.Sprintf("sudo cp %s /etc/pf.anchors/%s", tmpFile, anchorName),
			fmt.Sprintf("sudo sh -c \"grep -q '%s' /etc/pf.conf || echo '%s' >> /etc/pf.conf\"", anchorLine, anchorLine),
			fmt.Sprintf("sudo sh -c \"grep -q '%s' /etc/pf.conf || echo '%s' >> /etc/pf.conf\"", loadLine, loadLine),
			"sudo pfctl -f /etc/pf.conf",
		)
	case "list":
		cmds = append(cmds, "sudo pfctl -sr")
	case "remove":
		// 目前未做真实 pf 规则删除（需要解析 anchor 文件并重写），仅返回指纹占位以允许后端标记 removed
		resp.Message = "当前版本仅做数据库标记，不直接修改 pf 规则"
		if req.Fingerprint != "" {
			resp.Fingerprint = req.Fingerprint
		}
	default:
		resp.Message = "未知操作"
		return resp, nil
	}

	if len(req.CommandsOverride) > 0 {
		cmds = req.CommandsOverride
	}
	resp.PlannedCommands = cmds
	return resp, nil
}

func runCapture(args []string) (string, error) {
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

func escSingle(s string) string { return strings.ReplaceAll(s, "'", "'\\''") }
