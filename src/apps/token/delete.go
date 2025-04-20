package token

import (
	"alemongo/src/config"
	"alemongo/src/utils"

	"github.com/dgrijalva/jwt-go"
)

// tudo 是无法删除的。
// 删除token
func Delete(tokenValue string) error {
	// token
	token, err := jwt.Parse(tokenValue, func(token *jwt.Token) (interface{}, error) {
		return utils.StringToByte(config.Get().Server.Key), nil
	})

	if err != nil {
		return err
	}

	// token
	if token.Valid {
		return nil
	}

	return err
}
