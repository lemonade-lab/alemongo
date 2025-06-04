package utils

import (
	"github.com/patrickmn/go-cache"
	"time"
)

const (
	EmailExpirationTime = 3 * time.Minute
)

var EmailCodeCache *cache.Cache

// InitCache 初始化缓存, 设置默认过期时间为3min, 清除时间为10min
func InitCache() {
	EmailCodeCache = cache.New(3*time.Minute, 10*time.Minute)
}

// SetEmailCode 缓存邮箱验证码(可传入自定义过期时间，默认为3min)
func SetEmailCode(email, code string, expireation time.Duration) {
	EmailCodeCache.Set("email_code:"+email, code, expireation)
}

// GetEmailCode 获取验证码，如果不存在或者过期则返回false
func GetEmailCode(email string) (string, bool) {
	val, found := EmailCodeCache.Get("email_code:" + email)
	if !found {
		return "", false
	}
	code, ok := val.(string)
	return code, ok
}

// DeleteEmailCode 删除验证码
func DeleteEmailCode(email string) {
	EmailCodeCache.Delete("email_code:" + email)
}
