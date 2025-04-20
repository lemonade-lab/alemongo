package token

import (
	"alemongo/src/config"
	"alemongo/src/utils"
	"time"

	"github.com/dgrijalva/jwt-go"
)

// 生成token
func Create(username string) (string, error) {
	// 初始化
	claims := &Claims{
		Username: username, // 设置username
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * 1).Unix(), // 1小时过期
		},
	}

	// 创建token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// 加密
	tokenValue, err := token.SignedString(utils.StringToByte(config.Get().Server.Key))

	// 发生错误
	if err != nil {
		return "", err
	}

	return tokenValue, nil
}
