package token

import (
	"alemongo/src/config"
	"alemongo/src/utils"
	"time"

	"github.com/dgrijalva/jwt-go"
)

// 生成token
func Create(username string) (string, error) {
	expiresTime := config.Get().Server.Token.ExpiresTime

	// 初始化
	claims := &Claims{
		Username: username, // 设置 username
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * expiresTime).Unix(),
		},
		// 只携带就是用户名
	}

	// 创建token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// key
	key := config.Get().Server.Token.Key

	// 加密
	tokenValue, err := token.SignedString(utils.StringToByte(key))

	// 发生错误
	if err != nil {
		return "", err
	}

	return tokenValue, nil
}
