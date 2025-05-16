package token

import (
	"alemongo/src/config"
	"alemongo/src/utils"

	"github.com/dgrijalva/jwt-go"
)

// token鉴权
func Verify(tokenValue string) (*Claims, error) {
	// token
	token, err := jwt.ParseWithClaims(tokenValue, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		key := config.Get().Server.Token.Key
		return utils.StringToByte(key), nil
	})

	// 发生错误
	if err != nil {
		return nil, err
	}

	if message, ok := token.Claims.(*Claims); ok {
		// 是否过期
		if token.Valid {
			return message, err
		} else {
			// token过期
			return nil, err
		}
	}

	return nil, err
}
