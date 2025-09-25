package firewall

import (
	"fmt"
	"strconv"
	"strings"
	"unicode"
)

// SanitizeComment 过滤潜在命令注入字符，只保留安全集合，并限制最大长度。
// 允许: 字母/数字/空格/中文/ - _ . , : ; #
func SanitizeComment(in string) string {
	in = strings.TrimSpace(in)
	if in == "" {
		return ""
	}
	var b strings.Builder
	max := 120
	count := 0
	for _, r := range in {
		if count >= max {
			break
		}
		if r == ' ' || r == '\t' || r == '\n' {
			// 统一为空格
			if b.Len() > 0 && b.String()[b.Len()-1] == ' ' {
				continue
			}
			b.WriteByte(' ')
			count++
			continue
		}
		if unicode.IsLetter(r) || unicode.IsDigit(r) || (r >= 0x4E00 && r <= 0x9FFF) { // 中文基本区
			b.WriteRune(r)
			count++
			continue
		}
		switch r {
		case '-', '_', '.', ',', ':', ';', '#':
			b.WriteRune(r)
			count++
		}
	}
	out := strings.TrimSpace(b.String())
	return out
}

// NormalizeProtocol 仅保留 tcp/udp，其他一律归一为 tcp
func NormalizeProtocol(p string) string {
	switch strings.ToLower(strings.TrimSpace(p)) {
	case "tcp":
		return "tcp"
	case "udp":
		return "udp"
	default:
		return "tcp"
	}
}

// IsActionSupported 基础动作集合校验
func IsActionSupported(a string) bool {
	switch strings.ToLower(a) {
	case "enable", "disable", "reload", "allow", "block", "list", "remove":
		return true
	default:
		return false
	}
}

// BuildRuleFingerprint 生成规则指纹。仅对 allow/block 且端口>0 规则生成。
// 格式: backend|action|proto|port|commentHash(8)
// commentHash 使用简单 FNV-1a 截断，避免因备注过长导致指纹超长。
func BuildRuleFingerprint(backend, action string, port int, proto, comment string) string {
	action = strings.ToLower(strings.TrimSpace(action))
	if port <= 0 || port > 65535 {
		return ""
	}
	if action != "allow" && action != "block" {
		return ""
	}
	proto = NormalizeProtocol(proto)
	comment = SanitizeComment(comment)
	// FNV-1a 64 位, 截取前 8 hex
	var h uint64 = 1469598103934665603
	for i := 0; i < len(comment); i++ {
		h ^= uint64(comment[i])
		h *= 1099511628211
	}
	commentHash := strings.ToLower(fmt.Sprintf("%016x", h))[:8]
	return backend + "|" + action + "|" + proto + "|" + strconv.Itoa(port) + "|" + commentHash
}
