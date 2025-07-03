package jwt

import (
	"alemongo/src/apps/api/requests"
	"alemongo/src/dao"

	"alemongo/src/models"
	"alemongo/src/permission"
	"alemongo/src/settings"
	"errors"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

// 自定义Claims结构体
type Claims struct {
	Username string `json:"username"` // 添加username字段
	jwt.StandardClaims
}

// CreateToken 生成JWT
func CreateToken(username string) (string, error) {
	expiresTime := settings.Conf.Server.ExpiresTime
	claims := &Claims{
		Username: username,
		// 除标准字段外，只携带username
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * time.Duration(expiresTime)).Unix(),
		},
	}
	// 创建token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	secret := settings.Conf.Server.Key

	return token.SignedString([]byte(secret))
}

// todo token黑名单
// DeleteToken 删除token
func DeleteToken(tokenValue string) error {
	token, err := jwt.Parse(tokenValue, func(token *jwt.Token) (interface{}, error) {
		key := settings.Conf.Server.Key
		return []byte(key), nil
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

// ParseToken 解析JWT
func ParseToken(tokenValue string) (*Claims, error) {
	var mc = new(Claims)
	token, err := jwt.ParseWithClaims(tokenValue, mc, func(token *jwt.Token) (interface{}, error) {
		key := settings.Conf.Server.Key
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

// 鉴权
func Permission(c *gin.Context, mis int) string {
	// 读取用户信息
	username, exists := requests.GetUserName(c)
	if !exists {
		return "用户不存在"
	}
	var userInfo models.User
	if dao.IsSuperAdmin(username) {
		// 超级管理员 直接通过
		return ""
	} else {
		user, exist := dao.GetUserByUserName(username)
		if !exist {
			return "用户不存在"
		}
		userInfo = user
	}
	// 读取身份
	identity := userInfo.Identity
	ok := permission.CheckIdentityPermission(identity, mis)
	if !ok {
		return "权限不足"
	}
	return ""
}
