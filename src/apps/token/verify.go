package token

import (
	"alemongo/src/config"
	"alemongo/src/utils"

	"github.com/dgrijalva/jwt-go"
)

// token鉴权
func Verify(tokenValue string) (*Claims, error) {
	// token   // 结构体 // 回调
	token, err := jwt.ParseWithClaims(tokenValue, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return utils.StringToByte(config.Get().Server.Key), nil
	})

	if err != nil {
		return nil, err
	}

	if message, ok := token.Claims.(*Claims); ok {
		if token.Valid {
			// 上下文设置token
			return message, err
		} else {
			return message, err
		}
	}

	return nil, err
}
