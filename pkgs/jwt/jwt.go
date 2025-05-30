package jwt

import (
	"alemongo/src/settings"
	"errors"
	"github.com/dgrijalva/jwt-go"
	"time"
)

// 自定义Claims结构体
type Claims struct {
	Username string `json:"username"` // 添加username字段
	jwt.StandardClaims
}

// CreateToken 生成JWT
func CreateToken(username string) (string, error) {
	expiresTime := settings.Conf.ExpiresTime
	claims := &Claims{
		Username: username,
		// 除标准字段外，只携带username
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * expiresTime).Unix(),
		},
	}
	// 创建token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	secret := settings.Conf.Key

	return token.SignedString([]byte(secret))
}

// ParseToken 解析JWT
func ParseToken(tokenValue string) (*Claims, error) {
	var mc = new(Claims)
	token, err := jwt.ParseWithClaims(tokenValue, mc, func(token *jwt.Token) (interface{}, error) {
		key := settings.Conf.Key
		return []byte(key), nil
	})
	if err != nil {
		return nil, err
	}

	if token.Valid {
		return mc, nil
	}
	return nil, errors.New("invalid token")
}
