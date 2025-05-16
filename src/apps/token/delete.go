package token

import (
	"alemongo/src/config"
	"alemongo/src/utils"

	"github.com/dgrijalva/jwt-go"
)

// tudo
// token 无法删除。
// 但token可以设置过期时间。
// 如果给token标注废弃，需要做token的黑名单。

// 删除token
func Delete(tokenValue string) error {
	// token
	token, err := jwt.Parse(tokenValue, func(token *jwt.Token) (interface{}, error) {
		key := config.Get().Server.Token.Key
		return utils.StringToByte(key), nil
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
