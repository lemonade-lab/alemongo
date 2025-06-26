package logic

import (
	"alemongo/src/dao"
	"alemongo/src/models"
	"alemongo/src/utils"
	"log"
)

func GenerateSSH(req *models.SSHReq) (string, error) {
	skgCmd, err := utils.BuildSSHKeygenArgs(*req)
	if err != nil {
		return "", err
	}
	log.Println("执行指令: ", skgCmd)
	return dao.GenerateSSH(skgCmd, req.FilePath)
}
