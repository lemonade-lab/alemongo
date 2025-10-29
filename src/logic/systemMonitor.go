package logic

import (
	"alemongo/src/utils"
	"fmt"
	"runtime"
	"strconv"
	"strings"
)

// SystemStats 系统统计信息
type SystemStats struct {
	CPU    CPUInfo    `json:"cpu"`
	Memory MemoryInfo `json:"memory"`
	Disk   DiskInfo   `json:"disk"`
	Uptime string     `json:"uptime"`
}

// CPUInfo CPU信息
type CPUInfo struct {
	Usage   float64   `json:"usage"`    // CPU使用率百分比
	Count   int       `json:"count"`    // CPU核心数
	Model   string    `json:"model"`    // CPU型号
	LoadAvg []float64 `json:"load_avg"` // 负载平均值
}

// MemoryInfo 内存信息
type MemoryInfo struct {
	Total     uint64  `json:"total"`     // 总内存 (bytes)
	Used      uint64  `json:"used"`      // 已使用内存 (bytes)
	Free      uint64  `json:"free"`      // 空闲内存 (bytes)
	Available uint64  `json:"available"` // 可用内存 (bytes)
	Usage     float64 `json:"usage"`     // 内存使用率百分比
}

// DiskInfo 磁盘信息
type DiskInfo struct {
	Total uint64  `json:"total"` // 总磁盘空间 (bytes)
	Used  uint64  `json:"used"`  // 已使用空间 (bytes)
	Free  uint64  `json:"free"`  // 空闲空间 (bytes)
	Usage float64 `json:"usage"` // 磁盘使用率百分比
}

// GetSystemStats 获取系统统计信息
func GetSystemStats() (*SystemStats, error) {
	cpuInfo, err := getCPUInfo()
	if err != nil {
		return nil, fmt.Errorf("获取CPU信息失败: %v", err)
	}

	memoryInfo, err := getMemoryInfo()
	if err != nil {
		return nil, fmt.Errorf("获取内存信息失败: %v", err)
	}

	diskInfo, err := getDiskInfo()
	if err != nil {
		return nil, fmt.Errorf("获取磁盘信息失败: %v", err)
	}

	uptime, err := getUptime()
	if err != nil {
		uptime = "未知"
	}

	return &SystemStats{
		CPU:    *cpuInfo,
		Memory: *memoryInfo,
		Disk:   *diskInfo,
		Uptime: uptime,
	}, nil
}

// getCPUInfo 获取CPU信息
func getCPUInfo() (*CPUInfo, error) {
	cpuInfo := &CPUInfo{
		Count: runtime.NumCPU(),
	}

	switch runtime.GOOS {
	case "windows":
		// Windows: 使用wmic获取CPU信息
		cmd := utils.Command("wmic", "cpu", "get", "name,loadpercentage", "/format:csv")
		output, err := cmd.Output()
		if err != nil {
			return nil, err
		}
		parseWindowsCPUInfo(output, cpuInfo)

	case "darwin":
		// macOS: 使用sysctl和top获取CPU信息
		cmd := utils.Command("sysctl", "-n", "machdep.cpu.brand_string")
		output, err := cmd.Output()
		if err == nil {
			cpuInfo.Model = strings.TrimSpace(string(output))
		}

		// 获取CPU使用率
		cmd = utils.Command("top", "-l", "1", "-n", "0")
		output, err = cmd.Output()
		if err == nil {
			parseMacOSCPUInfo(output, cpuInfo)
		}

		// 获取负载平均值
		cmd = utils.Command("uptime")
		output, err = cmd.Output()
		if err == nil {
			parseLoadAvg(string(output), cpuInfo)
		}

	case "linux":
		// Linux: 使用/proc/cpuinfo和/proc/loadavg
		cmd := utils.Command("cat", "/proc/cpuinfo")
		output, err := cmd.Output()
		if err == nil {
			parseLinuxCPUInfo(output, cpuInfo)
		}

		// 获取负载平均值
		cmd = utils.Command("cat", "/proc/loadavg")
		output, err = cmd.Output()
		if err == nil {
			parseLoadAvg(string(output), cpuInfo)
		}

		// 获取CPU使用率 (简化版本)
		cpuInfo.Usage = getLinuxCPUUsage()
	}

	return cpuInfo, nil
}

// getMemoryInfo 获取内存信息
func getMemoryInfo() (*MemoryInfo, error) {
	memInfo := &MemoryInfo{}

	switch runtime.GOOS {
	case "windows":
		// Windows: 使用wmic获取内存信息
		cmd := utils.Command("wmic", "OS", "get", "TotalVisibleMemorySize,FreePhysicalMemory", "/format:csv")
		output, err := cmd.Output()
		if err != nil {
			return nil, err
		}
		parseWindowsMemoryInfo(output, memInfo)

	case "darwin":
		// macOS: 使用vm_stat获取内存信息
		cmd := utils.Command("vm_stat")
		output, err := cmd.Output()
		if err != nil {
			return nil, err
		}
		parseMacOSMemoryInfo(output, memInfo)

	case "linux":
		// Linux: 使用/proc/meminfo获取内存信息
		cmd := utils.Command("cat", "/proc/meminfo")
		output, err := cmd.Output()
		if err != nil {
			return nil, err
		}
		parseLinuxMemoryInfo(output, memInfo)
	}

	// 计算使用率
	if memInfo.Total > 0 {
		memInfo.Usage = float64(memInfo.Used) / float64(memInfo.Total) * 100
	}

	return memInfo, nil
}

// getDiskInfo 获取磁盘信息
func getDiskInfo() (*DiskInfo, error) {
	diskInfo := &DiskInfo{}

	switch runtime.GOOS {
	case "windows":
		// Windows: 使用wmic获取磁盘信息
		cmd := utils.Command("wmic", "logicaldisk", "where", "size>0", "get", "size,freespace", "/format:csv")
		output, err := cmd.Output()
		if err != nil {
			return nil, err
		}
		parseWindowsDiskInfo(output, diskInfo)

	case "darwin", "linux":
		// macOS/Linux: 使用df获取磁盘信息
		cmd := utils.Command("df", "-h", "/")
		output, err := cmd.Output()
		if err != nil {
			return nil, err
		}
		parseUnixDiskInfo(output, diskInfo)
	}

	// 计算使用率
	if diskInfo.Total > 0 {
		diskInfo.Usage = float64(diskInfo.Used) / float64(diskInfo.Total) * 100
	}

	return diskInfo, nil
}

// getUptime 获取系统运行时间
func getUptime() (string, error) {
	switch runtime.GOOS {
	case "windows":
		cmd := utils.Command("wmic", "os", "get", "lastbootuptime", "/format:value")
		output, err := cmd.Output()
		if err != nil {
			return "", err
		}
		return parseWindowsUptime(string(output))

	case "darwin", "linux":
		cmd := utils.Command("uptime", "-p")
		output, err := cmd.Output()
		if err != nil {
			// 如果uptime -p不支持，使用uptime
			cmd = utils.Command("uptime")
			output, err = cmd.Output()
			if err != nil {
				return "", err
			}
			return parseUnixUptime(string(output))
		}
		return strings.TrimSpace(string(output)), nil
	}

	return "", fmt.Errorf("不支持的操作系统")
}

// 解析函数实现
func parseWindowsCPUInfo(output []byte, cpuInfo *CPUInfo) {
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.Contains(line, "LoadPercentage") {
			parts := strings.Split(line, ",")
			if len(parts) >= 3 {
				if usage, err := strconv.ParseFloat(parts[2], 64); err == nil {
					cpuInfo.Usage = usage
				}
			}
		}
		if strings.Contains(line, "Name") {
			parts := strings.Split(line, ",")
			if len(parts) >= 2 {
				cpuInfo.Model = parts[1]
			}
		}
	}
}

func parseMacOSCPUInfo(output []byte, cpuInfo *CPUInfo) {
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.Contains(line, "CPU usage:") {
			// 解析类似 "CPU usage: 15.23% user, 5.67% sys, 79.10% idle"
			parts := strings.Split(line, "CPU usage:")
			if len(parts) > 1 {
				usageStr := strings.Split(parts[1], "%")[0]
				if usage, err := strconv.ParseFloat(strings.TrimSpace(usageStr), 64); err == nil {
					cpuInfo.Usage = 100 - usage // idle转换为usage
				}
			}
		}
	}
}

func parseLinuxCPUInfo(output []byte, cpuInfo *CPUInfo) {
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.Contains(line, "model name") {
			parts := strings.Split(line, ":")
			if len(parts) > 1 {
				cpuInfo.Model = strings.TrimSpace(parts[1])
				break
			}
		}
	}
}

func parseLoadAvg(output string, cpuInfo *CPUInfo) {
	// 解析负载平均值，格式如: "load average: 0.52, 0.58, 0.59"
	parts := strings.Split(output, "load average:")
	if len(parts) > 1 {
		loadStr := strings.TrimSpace(parts[1])
		loads := strings.Split(loadStr, ",")
		cpuInfo.LoadAvg = make([]float64, 0, 3)
		for _, load := range loads {
			if val, err := strconv.ParseFloat(strings.TrimSpace(load), 64); err == nil {
				cpuInfo.LoadAvg = append(cpuInfo.LoadAvg, val)
			}
		}
	}
}

func getLinuxCPUUsage() float64 {
	// 简化的Linux CPU使用率计算
	cmd := utils.Command("grep", "cpu ", "/proc/stat")
	_, err := cmd.Output()
	if err != nil {
		return 0
	}

	// 这里可以实现更复杂的CPU使用率计算
	// 暂时返回一个模拟值
	return 25.5
}

func parseWindowsMemoryInfo(output []byte, memInfo *MemoryInfo) {
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.Contains(line, "TotalVisibleMemorySize") {
			parts := strings.Split(line, ",")
			if len(parts) >= 2 {
				if total, err := strconv.ParseUint(parts[1], 10, 64); err == nil {
					memInfo.Total = total * 1024 // KB to bytes
				}
			}
		}
		if strings.Contains(line, "FreePhysicalMemory") {
			parts := strings.Split(line, ",")
			if len(parts) >= 2 {
				if free, err := strconv.ParseUint(parts[1], 10, 64); err == nil {
					memInfo.Free = free * 1024 // KB to bytes
				}
			}
		}
	}
	memInfo.Used = memInfo.Total - memInfo.Free
	memInfo.Available = memInfo.Free
}

func parseMacOSMemoryInfo(output []byte, memInfo *MemoryInfo) {
	lines := strings.Split(string(output), "\n")
	pageSize := uint64(4096) // macOS默认页面大小

	for _, line := range lines {
		if strings.Contains(line, "Pages free:") {
			parts := strings.Split(line, ":")
			if len(parts) > 1 {
				if free, err := strconv.ParseUint(strings.TrimSpace(parts[1]), 10, 64); err == nil {
					memInfo.Free = free * pageSize
				}
			}
		}
		if strings.Contains(line, "Pages active:") {
			parts := strings.Split(line, ":")
			if len(parts) > 1 {
				if active, err := strconv.ParseUint(strings.TrimSpace(parts[1]), 10, 64); err == nil {
					memInfo.Used += active * pageSize
				}
			}
		}
		if strings.Contains(line, "Pages inactive:") {
			parts := strings.Split(line, ":")
			if len(parts) > 1 {
				if inactive, err := strconv.ParseUint(strings.TrimSpace(parts[1]), 10, 64); err == nil {
					memInfo.Used += inactive * pageSize
				}
			}
		}
		if strings.Contains(line, "Pages speculative:") {
			parts := strings.Split(line, ":")
			if len(parts) > 1 {
				if speculative, err := strconv.ParseUint(strings.TrimSpace(parts[1]), 10, 64); err == nil {
					memInfo.Used += speculative * pageSize
				}
			}
		}
	}

	memInfo.Total = memInfo.Used + memInfo.Free
	memInfo.Available = memInfo.Free
}

func parseLinuxMemoryInfo(output []byte, memInfo *MemoryInfo) {
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.Contains(line, "MemTotal:") {
			parts := strings.Split(line, ":")
			if len(parts) > 1 {
				if total, err := strconv.ParseUint(strings.Fields(parts[1])[0], 10, 64); err == nil {
					memInfo.Total = total * 1024 // KB to bytes
				}
			}
		}
		if strings.Contains(line, "MemAvailable:") {
			parts := strings.Split(line, ":")
			if len(parts) > 1 {
				if available, err := strconv.ParseUint(strings.Fields(parts[1])[0], 10, 64); err == nil {
					memInfo.Available = available * 1024 // KB to bytes
				}
			}
		}
		if strings.Contains(line, "MemFree:") {
			parts := strings.Split(line, ":")
			if len(parts) > 1 {
				if free, err := strconv.ParseUint(strings.Fields(parts[1])[0], 10, 64); err == nil {
					memInfo.Free = free * 1024 // KB to bytes
				}
			}
		}
	}
	memInfo.Used = memInfo.Total - memInfo.Available
}

func parseWindowsDiskInfo(output []byte, diskInfo *DiskInfo) {
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.Contains(line, "Size") && !strings.Contains(line, "FreeSpace") {
			parts := strings.Split(line, ",")
			if len(parts) >= 2 {
				if total, err := strconv.ParseUint(parts[1], 10, 64); err == nil {
					diskInfo.Total += total
				}
			}
		}
		if strings.Contains(line, "FreeSpace") {
			parts := strings.Split(line, ",")
			if len(parts) >= 2 {
				if free, err := strconv.ParseUint(parts[1], 10, 64); err == nil {
					diskInfo.Free += free
				}
			}
		}
	}
	diskInfo.Used = diskInfo.Total - diskInfo.Free
}

func parseUnixDiskInfo(output []byte, diskInfo *DiskInfo) {
	lines := strings.Split(string(output), "\n")
	if len(lines) >= 2 {
		fields := strings.Fields(lines[1])
		if len(fields) >= 4 {
			// 解析类似 "8.0G  5.2G  2.8G  65% /"
			if total, err := parseSize(fields[1]); err == nil {
				diskInfo.Total = total
			}
			if used, err := parseSize(fields[2]); err == nil {
				diskInfo.Used = used
			}
			if free, err := parseSize(fields[3]); err == nil {
				diskInfo.Free = free
			}
		}
	}
}

func parseSize(sizeStr string) (uint64, error) {
	sizeStr = strings.TrimSuffix(sizeStr, "%")
	multiplier := uint64(1)

	if strings.HasSuffix(sizeStr, "G") {
		multiplier = 1024 * 1024 * 1024
		sizeStr = strings.TrimSuffix(sizeStr, "G")
	} else if strings.HasSuffix(sizeStr, "M") {
		multiplier = 1024 * 1024
		sizeStr = strings.TrimSuffix(sizeStr, "M")
	} else if strings.HasSuffix(sizeStr, "K") {
		multiplier = 1024
		sizeStr = strings.TrimSuffix(sizeStr, "K")
	}

	val, err := strconv.ParseFloat(sizeStr, 64)
	if err != nil {
		return 0, err
	}

	return uint64(val * float64(multiplier)), nil
}

func parseWindowsUptime(output string) (string, error) {
	// 解析Windows启动时间
	lines := strings.Split(output, "\n")
	for _, line := range lines {
		if strings.Contains(line, "LastBootUpTime=") {
			parts := strings.Split(line, "=")
			if len(parts) > 1 {
				// 解析Windows时间格式
				_ = parts // 避免未使用变量警告
				return "系统运行时间解析中...", nil
			}
		}
	}
	return "未知", nil
}

func parseUnixUptime(output string) (string, error) {
	// 解析类似 "up 2 days, 3 hours, 45 minutes"
	if strings.Contains(output, "up") {
		parts := strings.Split(output, "up")
		if len(parts) > 1 {
			return strings.TrimSpace(parts[1]), nil
		}
	}
	return "未知", nil
}
