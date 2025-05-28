package common

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"strings"
	"time"
)

var ipServices = []string{
	"https://api.ipify.org?format=text",
	"https://ifconfig.me",
	"https://myip.ipip.net",
	"https://ipinfo.io/ip",
	"https://icanhazip.com",
	"https://wtfismyip.com/text",
}

// 获取公网 IP
func getPublicIP(ctx context.Context) (string, error) {
	type result struct {
		ip  string
		err error
	}
	ch := make(chan result, len(ipServices))

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	client := &http.Client{Timeout: 3 * time.Second}

	for _, url := range ipServices {
		go func(u string) {
			req, err := http.NewRequestWithContext(ctx, "GET", u, nil)
			if err != nil {
				ch <- result{"", err}
				return
			}
			resp, err := client.Do(req)
			if err != nil {
				ch <- result{"", err}
				return
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				ch <- result{"", fmt.Errorf("http status %d", resp.StatusCode)}
				return
			}

			data, err := io.ReadAll(resp.Body)
			if err != nil {
				ch <- result{"", err}
				return
			}
			text := strings.TrimSpace(string(data))
			if net.ParseIP(text) == nil {
				ch <- result{"", fmt.Errorf("invalid ip address %s", text)}
				return
			}
			ch <- result{ip: text, err: nil}
		}(url)
	}

	var lastErr error
	for i := 0; i < len(ipServices); i++ {
		select {
		case <-ctx.Done():
			return "", errors.New("timeout")
		case res := <-ch:
			if res.err == nil {
				return res.ip, nil
			}
			lastErr = res.err
		}
	}
	return "", fmt.Errorf("%w", lastErr)
}

// 获取 内网 IP
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
