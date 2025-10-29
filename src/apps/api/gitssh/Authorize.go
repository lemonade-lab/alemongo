package gitssh

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/paths"
	"alemongo/src/utils"
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// 添加互斥锁保护文件操作
var knownHostsMutex sync.Mutex

// 域名验证正则表达式
var domainRegex = regexp.MustCompile(`^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$`)

func Authorize(c *gin.Context) {
	hostname := strings.TrimSpace(c.PostForm("address"))
	if hostname == "" {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "授权地址不能为空")
		return
	}

	// 验证主机名格式
	if !isValidHostname(hostname) {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "主机名格式无效")
		return
	}

	// 添加主机到 known_hosts
	err := addHostToKnownHosts(hostname)
	if err != nil {
		log.Printf("授权失败 - 主机: %s, 错误: %v", hostname, err)
		// 不暴露具体错误信息给客户端
		response.ResponseErrorWithMsg(c, http.StatusInternalServerError, http.StatusInternalServerError, "授权失败，请检查主机地址是否正确")
		return
	}

	log.Printf("主机授权成功: %s", hostname)
	response.ResponseSuccessWithMsg(c, nil, "授权完成")
}

// 验证主机名格式
func isValidHostname(hostname string) bool {
	// 检查是否为空或包含危险字符
	if hostname == "" || strings.ContainsAny(hostname, " \t\n\r;|&$`\"'\\") {
		return false
	}

	// 分离主机名和端口
	host, port, err := net.SplitHostPort(hostname)
	if err != nil {
		// 没有端口，直接验证主机名
		host = hostname
	} else {
		// 验证端口范围
		if portNum, err := strconv.Atoi(port); err != nil || portNum < 1 || portNum > 65535 {
			return false
		}
	}

	// 尝试解析为IP
	if net.ParseIP(host) != nil {
		return true
	}

	// 域名格式检查
	if len(host) > 253 || len(host) == 0 {
		return false
	}

	// 使用正则表达式验证域名格式
	return domainRegex.MatchString(host)
}

func addHostToKnownHosts(hostname string) error {
	// 使用互斥锁保护文件操作
	knownHostsMutex.Lock()
	defer knownHostsMutex.Unlock()

	// 获取 known_hosts 路径
	knownHostsPath, err := paths.GetSSHAuthPathByName("known_hosts")
	if err != nil {
		return fmt.Errorf("获取 known_hosts 路径失败: %v", err)
	}

	// 检查主机是否已存在
	exists, err := isHostInKnownHosts(knownHostsPath, hostname)
	if err != nil {
		log.Printf("检查 known_hosts 时出错: %v", err)
	}
	if exists {
		log.Printf("主机 %s 已存在于 known_hosts 中", hostname)
		return nil
	}

	// 执行 ssh-keyscan 命令
	log.Printf("正在扫描主机 %s 的密钥...", hostname)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// 添加更多密钥类型支持
	cmd := utils.CommandContext(ctx, "ssh-keyscan", hostname)
	output, err := cmd.Output()
	if err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			return fmt.Errorf("连接主机 %s 超时", hostname)
		}
		return fmt.Errorf("ssh-keyscan 执行失败: %v", err)
	}

	if len(output) == 0 {
		return fmt.Errorf("未能获取主机 %s 的公钥", hostname)
	}

	// 追加到 known_hosts 文件
	err = appendToKnownHosts(knownHostsPath, output)
	if err != nil {
		return fmt.Errorf("写入 known_hosts 文件失败: %v", err)
	}

	log.Printf("主机 %s 的密钥已添加到 known_hosts", hostname)
	return nil
}

// 原子性写入 known_hosts 文件
func appendToKnownHosts(knownHostsPath string, data []byte) error {
	file, err := os.OpenFile(knownHostsPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0600)
	if err != nil {
		return err
	}
	defer file.Close()

	// 确保输出以换行符结尾
	if !strings.HasSuffix(string(data), "\n") {
		data = append(data, '\n')
	}

	_, err = file.Write(data)
	return err
}

// 检查主机是否已在 known_hosts 中
func isHostInKnownHosts(knownHostsPath, hostname string) (bool, error) {
	// 首先使用 ssh-keygen 检查 hashed 条目
	if checkHashedKnownHost(knownHostsPath, hostname) {
		return true, nil
	}

	// 然后检查明文条目
	content, err := os.ReadFile(knownHostsPath)
	if err != nil {
		if os.IsNotExist(err) {
			return false, nil
		}
		return false, err
	}

	lines := strings.Split(string(content), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		fields := strings.Fields(line)
		if len(fields) >= 2 {
			hostField := fields[0]
			// 跳过 hashed 格式（已经在上面检查过）
			if strings.HasPrefix(hostField, "|1|") {
				continue
			}

			// 处理多个主机名的情况 (逗号分隔)
			hosts := strings.Split(hostField, ",")
			for _, host := range hosts {
				if strings.TrimSpace(host) == hostname {
					return true, nil
				}
			}
		}
	}

	return false, nil
}

// 使用 ssh-keygen 检查 hashed known_hosts
func checkHashedKnownHost(knownHostsPath, hostname string) bool {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := utils.CommandContext(ctx, "ssh-keygen", "-F", hostname, "-f", knownHostsPath)
	err := cmd.Run()
	return err == nil
}
