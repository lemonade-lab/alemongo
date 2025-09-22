package logic

import (
	"alemongo/src/models"
	"fmt"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
)

// GetAllPorts 获取所有被占用的端口信息
func GetAllPorts() ([]models.PortInfo, error) {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "windows":
		// Windows使用netstat命令
		cmd = exec.Command("netstat", "-ano")
	case "darwin", "linux":
		// macOS/Linux使用lsof命令
		cmd = exec.Command("lsof", "-i", "-P", "-n")
	default:
		return nil, fmt.Errorf("不支持的操作系统")
	}

	output, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	ports := parseAllPortsOutput(string(output), runtime.GOOS)
	return ports, nil
}

// parseAllPortsOutput 解析所有端口输出信息
func parseAllPortsOutput(output, osType string) []models.PortInfo {
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
				portInfo.Protocol = fields[0]
				portInfo.Local = fields[1]
				portInfo.Remote = fields[2]
				portInfo.State = fields[3]
				// 提取PID
				if len(fields) > 4 {
					portInfo.PID = fields[4]
				}
				ports = append(ports, portInfo)
			}
		} else {
			// macOS/Linux lsof 输出格式
			// COMMAND  PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
			// node    1234 user   20u  IPv4  12345      0t0  TCP *:8080 (LISTEN)
			fields := strings.Fields(line)
			if len(fields) >= 9 {
				portInfo.PID = fields[1]
				// 解析NAME字段
				nameField := strings.Join(fields[8:], " ")
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
				if strings.Contains(fields[4], "IPv4") {
					portInfo.Protocol = "TCP"
				} else if strings.Contains(fields[4], "IPv6") {
					portInfo.Protocol = "TCP6"
				} else {
					portInfo.Protocol = "UNKNOWN"
				}

				ports = append(ports, portInfo)
			}
		}
	}

	return ports
}

// GetPortsByProcess 根据进程名获取端口信息
func GetPortsByProcess(processName string) ([]models.PortInfo, error) {
	allPorts, err := GetAllPorts()
	if err != nil {
		return nil, err
	}

	// 这里需要根据PID获取进程名，暂时返回所有端口
	// 实际实现中可以通过PID查询进程名
	filteredPorts := allPorts

	return filteredPorts, nil
}

// GetPortsByPort 根据端口号获取端口信息
func GetPortsByPort(portNumber int) ([]models.PortInfo, error) {
	allPorts, err := GetAllPorts()
	if err != nil {
		return nil, err
	}

	var filteredPorts []models.PortInfo
	portStr := strconv.Itoa(portNumber)

	for _, port := range allPorts {
		if strings.Contains(port.Local, ":"+portStr) || strings.Contains(port.Remote, ":"+portStr) {
			filteredPorts = append(filteredPorts, port)
		}
	}

	return filteredPorts, nil
}
