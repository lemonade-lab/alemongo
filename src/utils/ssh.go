package utils

import (
	"alemongo/src/models"
	"os"
	"path/filepath"
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
	if req.FilePath != "" {
		filePath := filepath.Clean(req.FilePath)
		dirPath := filepath.Dir(filePath)
		if _, err := os.Stat(dirPath); os.IsNotExist(err) {
			if os.MkdirAll(dirPath, os.ModePerm); err != nil {
				return []string{}, err
			}
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
