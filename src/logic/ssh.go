package logic

import (
	"alemongo/src/dao"
	"alemongo/src/models"
	"alemongo/src/utils"
)

func GenerateSSH(req *models.SSHReq) (string, error) {
	skgCmd, err := utils.BuildSSHKeygenArgs(*req)
	if err != nil {
		return "", err
	}
	return dao.GenerateSSH(skgCmd, req.FilePath)
}
