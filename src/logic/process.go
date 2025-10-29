package logic

import (
	"alemongo/src/models"
	"alemongo/src/utils"
	"context"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"time"
)

// GetProcessPorts 获取进程占用的端口信息
func GetProcessPorts(pid int) (*models.ProcessPortInfo, error) {
	if pid <= 0 {
		return &models.ProcessPortInfo{
			PID:   pid,
			Ports: []models.PortInfo{},
			Error: "无效的进程ID",
		}, nil
	}

	var cmd *exec.Cmd
	pidStr := strconv.Itoa(pid)
	// 为外部命令增加超时，防止偶发性挂起
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	switch runtime.GOOS {
	case "windows":
		// Windows使用netstat命令
		if _, err := exec.LookPath("netstat"); err != nil {
			return &models.ProcessPortInfo{
				PID:   pid,
				Ports: []models.PortInfo{},
				Error: "netstat 未安装或不可用，无法查询进程端口",
			}, nil
		}
		cmd = utils.CommandContext(ctx, "netstat", "-ano")
	case "darwin", "linux":
		// macOS/Linux使用lsof命令
		if _, err := exec.LookPath("lsof"); err != nil {
			return &models.ProcessPortInfo{
				PID:   pid,
				Ports: []models.PortInfo{},
				Error: "lsof 未安装或不可用，请先安装 lsof 后重试（容器中已包含；若自建环境请安装）",
			}, nil
		}
		cmd = utils.CommandContext(ctx, "lsof", "-Pan", "-p", pidStr, "-i")
	default:
		return &models.ProcessPortInfo{
			PID:   pid,
			Ports: []models.PortInfo{},
			Error: "不支持的操作系统",
		}, nil
	}

	output, err := cmd.Output()
	if err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			return &models.ProcessPortInfo{
				PID:   pid,
				Ports: []models.PortInfo{},
				Error: "查询进程端口超时，请稍后重试",
			}, nil
		}
		return &models.ProcessPortInfo{
			PID:   pid,
			Ports: []models.PortInfo{},
			Error: "无法获取进程端口信息: " + err.Error(),
		}, nil
	}

	ports := parsePortOutput(string(output), runtime.GOOS, pidStr)

	return &models.ProcessPortInfo{
		PID:   pid,
		Ports: ports,
	}, nil
}

// parsePortOutput 解析端口输出信息
func parsePortOutput(output, osType, pidStr string) []models.PortInfo {
	var ports []models.PortInfo
	lines := strings.Split(output, "\n")

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		var portInfo models.PortInfo

		if osType == "windows" {
			// Windows netstat 输出格式
			// Proto  Local Address          Foreign Address        State           PID
			// TCP    0.0.0.0:80             0.0.0.0:0              LISTENING       1234
			fields := strings.Fields(line)
			if len(fields) >= 5 {
				// 检查PID是否匹配
				if fields[len(fields)-1] == pidStr {
					portInfo.Protocol = fields[0]
					portInfo.Local = fields[1]
					portInfo.Remote = fields[2]
					portInfo.State = fields[3]
					portInfo.PID = pidStr
					ports = append(ports, portInfo)
				}
			}
		} else {
			// macOS/Linux lsof 输出格式
			// COMMAND  PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
			// node    1234 user   20u  IPv4  12345      0t0  TCP *:8080 (LISTEN)
			fields := strings.Fields(line)
			if len(fields) >= 9 {
				// 检查PID是否匹配
				if fields[1] == pidStr {
					// 解析NAME字段，格式如: *:8080 (LISTEN) 或 localhost:8080->localhost:12345 (ESTABLISHED)
					nameField := strings.Join(fields[8:], " ")
					// 协议优先从 NAME 中提取（更可靠，区分 TCP/UDP）
					proto := ""
					if strings.Contains(nameField, "UDP6") {
						proto = "UDP6"
					} else if strings.Contains(nameField, "UDP") {
						proto = "UDP"
					} else if strings.Contains(nameField, "TCP6") {
						proto = "TCP6"
					} else if strings.Contains(nameField, "TCP") {
						proto = "TCP"
					}
					if strings.Contains(nameField, "->") {
						// 有远程连接的格式
						parts := strings.Split(nameField, "->")
						if len(parts) == 2 {
							portInfo.Local = strings.TrimSpace(parts[0])
							remotePart := strings.TrimSpace(parts[1])
							// 提取状态信息
							if strings.Contains(remotePart, "(") {
								stateStart := strings.Index(remotePart, "(")
								portInfo.Remote = strings.TrimSpace(remotePart[:stateStart])
								portInfo.State = strings.Trim(remotePart[stateStart:], "()")
							} else {
								portInfo.Remote = remotePart
								portInfo.State = "UNKNOWN"
							}
						}
					} else {
						// 监听端口的格式
						if strings.Contains(nameField, "(") {
							stateStart := strings.Index(nameField, "(")
							portInfo.Local = strings.TrimSpace(nameField[:stateStart])
							portInfo.State = strings.Trim(nameField[stateStart:], "()")
							portInfo.Remote = "*:*"
						} else {
							portInfo.Local = nameField
							portInfo.Remote = "*:*"
							portInfo.State = "UNKNOWN"
						}
					}

					// 确定协议类型
					if proto != "" {
						portInfo.Protocol = proto
					} else if strings.Contains(fields[4], "IPv4") {
						portInfo.Protocol = "TCP" // 回退，通常为 TCP/UDP 的网络条目
					} else if strings.Contains(fields[4], "IPv6") {
						portInfo.Protocol = "TCP6"
					} else {
						portInfo.Protocol = "UNKNOWN"
					}
					portInfo.PID = pidStr

					ports = append(ports, portInfo)
				}
			}
		}
	}

	return ports
}
