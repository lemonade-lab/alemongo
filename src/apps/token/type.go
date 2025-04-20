package token

import (
	"github.com/dgrijalva/jwt-go"
)

// 自定义Claims结构体
type Claims struct {
	Username string `json:"username"` // 添加username字段
	jwt.StandardClaims
}
