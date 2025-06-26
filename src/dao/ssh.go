package dao

import (
	"bytes"
	"errors"
	"os"
	"os/exec"
	"path/filepath"
)

func GenerateSSH(skgCmd []string, filePath string) (string, error) {
	cmd := exec.Command("ssh-keygen", skgCmd...)
	_, err := cmd.CombinedOutput()
	if err != nil {
		return "", err
	}
	var pubKeyPath string
	if filePath != "" {
		pubKeyPath = filepath.Join(filePath, ".pub")
	} else {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return "", errors.New("无法获取用户主目录")
		}
		pubKeyPath = filepath.Join(homeDir, ".ssh", "id_rsa.pub")
	}

	pubBytes, err := os.ReadFile(pubKeyPath)
	if err != nil {
		return "", err
	}
	return string(bytes.TrimSpace(pubBytes)), nil
}
