package dao

import (
	"alemongo/src/utils"
	"log"
)

func GenerateSSH(skgCmd []string, name string) (string, error) {
	cmd := utils.Command("ssh-keygen", skgCmd...)
	_, err := cmd.CombinedOutput()
	if err != nil {
		log.Println(err)
		return "", err
	}
	return name, nil
}
