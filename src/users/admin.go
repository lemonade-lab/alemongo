package users

import (
	"alemongo/src/config"
	"alemongo/src/permission"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"log"
	"os"
	"path"
)

// 管理员账户
var admin User

// 生成随机密码
func generateRandomPassword(length int) string {
	bytes := make([]byte, length)
	_, err := rand.Read(bytes)
	if err != nil {
		// 如果随机数生成失败，返回一个默认密码
		return "defaultPassword123"
	}
	// 使用 base64 编码生成密码，并截取指定长度
	return base64.URLEncoding.EncodeToString(bytes)[:length]
}

func GetAdminAccount() User {
	if admin.UserName != "" {
		return admin
	}
	workPath := config.GetWorkPath()
	userListPath := path.Join(workPath, "users", "admin.json")
	if _, err := os.Stat(userListPath); os.IsNotExist(err) {
		// 生成随机密码
		password := generateRandomPassword(16)
		username := permission.DefaultUserName
		admin = User{
			Identity:   permission.IdentityAdmin,
			UserName:   username,
			PassWord:   password,
			MasterName: permission.DefaultUserName,
		}
		log.Printf("临时超级管理员账户信息：\n账户: %s\n密码: %s\n", admin.UserName, admin.PassWord)
		return admin
	}
	// 读取文件
	fileData, err := os.ReadFile(userListPath)
	if err != nil {
		// 读取失败。返回空。
		log.Printf("读取管理员账户文件错误: %v", err)
		return User{}
	}
	// 解析json
	err = json.Unmarshal(fileData, &admin)
	if err != nil {
		// 解析失败。返回空。
		log.Printf("读取管理员账户文件错误: %v", err)
		return User{}
	}
	// 返回管理员账户
	return admin
}

// 更改密码
func SetAdminPassword(password string) bool {
	// 如果密码为空。返回false
	if password == "" {
		return false
	}
	// 保存到文件
	workPath := config.GetWorkPath()
	userListPath := path.Join(workPath, "users", "admin.json")
	fileData, err := json.Marshal(User{
		Identity:   permission.IdentityAdmin,
		UserName:   admin.UserName,
		PassWord:   password,
		MasterName: permission.DefaultUserName,
	})
	if err != nil {
		return false
	}
	err = os.WriteFile(userListPath, fileData, 0644)
	if err != nil {
		return false
	}
	// 设置密码
	admin.PassWord = password
	return true
}

// 是否是超级管理员
func IsSuperAdmin(username string) bool {
	// 如果用户名是lemonade。返回true
	if username == admin.UserName {
		return true
	}
	// 否则返回false
	return false
}
