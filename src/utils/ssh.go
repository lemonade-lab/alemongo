package utils

import (
	"alemongo/src/models"
	"alemongo/src/paths"
	"os"
	"strconv"
)

func BuildSSHKeygenArgs(req models.SSHReq) ([]string, error) {
	var args []string

	args = append(args, "-q")

	if req.KeyType != "" {
		args = append(args, "-t", req.KeyType)
	}
	if req.BitSize > 0 && req.KeyType == "rsa" {
		args = append(args, "-b", strconv.FormatInt(req.BitSize, 10))
	}
	if req.Comment != "" {
		args = append(args, "-C", req.Comment)
	}
	if req.Name != "" {
		sshPath, err := paths.GetSSHPath()
		if err != nil {
			return []string{}, err
		}
		if _, err := os.Stat(sshPath); os.IsNotExist(err) {
			if os.MkdirAll(sshPath, os.ModePerm); err != nil {
				return []string{}, err
			}
		}
		filePath, err := paths.GetSSHAuthPathByName(req.Name)
		if err != nil {
			return []string{}, err
		}
		args = append(args, "-f", filePath)
	}
	args = append(args, "-N", req.Passphrase)

	if req.HashAlgo != "" {
		args = append(args, "-E", req.HashAlgo)
	}
	if req.KeyFormat != "" {
		args = append(args, "-m", req.KeyFormat)
	}

	return args, nil
}
