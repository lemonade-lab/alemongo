package utils

import (
	gitssh "github.com/go-git/go-git/v5/plumbing/transport/ssh"
	"os/user"
	"path/filepath"
)

// 获取 SSH 公钥认证
func GetSSHAuth() (*gitssh.PublicKeys, error) {
	usr, err := user.Current()
	if err != nil {
		return nil, err
	}
	privateKeyPath := filepath.Join(usr.HomeDir, ".ssh", "id_rsa")
	auth, err := gitssh.NewPublicKeysFromFile("git", privateKeyPath, "")
	if err != nil {
		return nil, err
	}
	return auth, nil
}
