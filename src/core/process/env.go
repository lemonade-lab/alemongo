package process

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

// 解析 .env 文件
func parseEnvFile(filePath string) (map[string]string, error) {
	envMap := make(map[string]string)

	file, err := os.Open(filePath)
	if err != nil {
		return envMap, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		// 跳过空行和注释行
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		// 查找等号分隔符
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])

		// 移除值两边的引号（如果存在）
		if len(value) >= 2 {
			if (strings.HasPrefix(value, "\"") && strings.HasSuffix(value, "\"")) ||
				(strings.HasPrefix(value, "'") && strings.HasSuffix(value, "'")) {
				value = value[1 : len(value)-1]
			}
		}

		envMap[key] = value
	}

	return envMap, scanner.Err()
}

// 加载环境变量
func LoadEnvironment(EnvFilePath string) []string {
	// 从系统环境变量开始
	env := os.Environ()

	// 如果配置了 .env 文件路径，则读取并合并
	if EnvFilePath != "" {
		envMap, err := parseEnvFile(EnvFilePath)
		if err == nil {
			// 将 .env 文件中的环境变量添加到环境变量列表
			for key, value := range envMap {
				env = append(env, fmt.Sprintf("%s=%s", key, value))
			}
		}
	}
	return env
}
