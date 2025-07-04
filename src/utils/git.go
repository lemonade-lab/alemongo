package utils

import (
	"alemongo/src/paths"

	gitssh "github.com/go-git/go-git/v5/plumbing/transport/ssh"
)

// 获取 SSH 公钥认证
func GetSSHAuth() (*gitssh.PublicKeys, error) {
	privateKeyPath, err := paths.GetSSHAuthPath()
	if err != nil {
		return nil, err
	}
	auth, err := gitssh.NewPublicKeysFromFile("git", privateKeyPath, "")
	if err != nil {
		return nil, err
	}
	return auth, nil
}
