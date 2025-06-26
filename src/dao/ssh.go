package dao

import (
	"bytes"
	"errors"
	"log"
	"os"
	"os/exec"
	"path/filepath"
)

func GenerateSSH(skgCmd []string, filePath string) (string, error) {
	cmd := exec.Command("ssh-keygen", skgCmd...)
	_, err := cmd.CombinedOutput()
	if err != nil {
		log.Println(err)
		return "", err
	}
	var pubKeyPath string
	log.Println("pub key path: ", filePath)
	if filePath != "" {
		pubKeyPath = filePath + ".pub"
	} else {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return "", errors.New("无法获取用户主目录")
		}
		pubKeyPath = filepath.Join(homeDir, ".ssh", "id_rsa.pub")
	}

	pubBytes, err := os.ReadFile(pubKeyPath)
	if err != nil {
		log.Println("读取公钥失败", err)
		return "", err
	}
	return string(bytes.TrimSpace(pubBytes)), nil
}
