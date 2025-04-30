package common

import (
	"fmt"
	"io"
	"net"
	"net/http"
)

// 获取公网 IP
func getPublicIP() (string, error) {
	resp, err := http.Get("https://api.ipify.org?format=text") // 使用 ipify 服务获取公网 IP
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	ip, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(ip), nil
}

// 获取内网 IP
func getPrivateIP() (string, error) {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return "", err
	}

	for _, addr := range addrs {
		// 检查地址是否是 IP 地址
		if ipNet, ok := addr.(*net.IPNet); ok && !ipNet.IP.IsLoopback() {
			if ipNet.IP.To4() != nil { // 只获取 IPv4 地址
				return ipNet.IP.String(), nil
			}
		}
	}

	return "", fmt.Errorf("未找到内网 IP")
}
