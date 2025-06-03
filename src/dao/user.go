package dao

import (
	"alemongo/src/models"
	"alemongo/src/permission"
	"alemongo/src/settings"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"log"
	"os"
	"path"
)

// 管理员账户
var admin models.User

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

func GetAdminAccount() models.User {
	if admin.UserName != "" {
		return admin
	}
	workPath := settings.GetWorkPath()
	userListPath := path.Join(workPath, "users", "admin.json")
	if _, err := os.Stat(userListPath); os.IsNotExist(err) {
		// 生成随机密码
		password := generateRandomPassword(16)
		username := permission.DefaultUserName
		admin = models.User{
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
		return models.User{}
	}
	// 解析json
	err = json.Unmarshal(fileData, &admin)
	if err != nil {
		// 解析失败。返回空。
		log.Printf("读取管理员账户文件错误: %v", err)
		return models.User{}
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
	workPath := settings.GetWorkPath()
	userListPath := path.Join(workPath, "users", "admin.json")
	fileData, err := json.Marshal(models.User{
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

func getListPath() string {
	workPath := settings.GetWorkPath()
	userPath := path.Join(settings.GetWorkPath(), "users")
	userListPath := path.Join(workPath, "users", "list.json")
	if _, err := os.Stat(userListPath); os.IsNotExist(err) {
		// 创建目录
		err := os.MkdirAll(userPath, os.ModePerm)
		if err != nil {
		}
		// 创建文件
		file, err := os.Create(userListPath)
		if err != nil {
		}
		defer file.Close()
		data := []models.User{}
		// 写入空数据
		_, err = json.Marshal(data)
		if err != nil {
		}
	}
	return userListPath
}

func GetList() []models.User {
	userListPath := getListPath()
	// 存在文件
	fileData, err := os.ReadFile(userListPath)
	if err != nil {
		return []models.User{}
	}
	// 解析json
	users := []models.User{}
	err = json.Unmarshal(fileData, &users)
	if err != nil {
		// tudo
		log.Println("解析json失败")
		return []models.User{}
	}
	// 返回
	return users
}

// 是否存在指定用户
func ExistUserByUserName(username string) bool {
	users := GetList()
	for _, user := range users {
		if user.UserName == username {
			return true
		}
	}
	return false
}

// 创建用户
func CreateUser(username string, password string, identity string) bool {
	// 判断是否存在
	if ExistUserByUserName(username) {
		log.Println("用户已存在")
		return false
	}
	users := GetList()
	// 创建用户
	user := models.User{
		UserName:   username,
		PassWord:   password,
		Identity:   identity,
		MasterName: permission.DefaultUserName,
	}
	users = append(users, user)
	userListPath := getListPath()
	fileData, err := json.Marshal(users)
	if err == nil {
		err = os.WriteFile(userListPath, fileData, 0644)
		if err == nil {
			return true
		}
	}
	// 失败了，删除用户
	users = users[:len(users)-1]
	fileData, err = json.Marshal(users)
	if err == nil {
		err = os.WriteFile(userListPath, fileData, 0644)
		if err == nil {
			return false
		}
	}
	return false
}

func GetUserByUserName(username string) (models.User, bool) {
	users := GetList()
	for _, user := range users {
		log.Println("user.UserName:", user.UserName)
		if user.UserName == username {
			return user, true
		}
	}
	return models.User{}, false
}

func SetUserByUserName(username string, password string) bool {
	users := GetList()
	// 得到 i
	curI := -1
	for i, user := range users {
		if user.UserName == username {
			curI = i
			break
		}
	}
	if curI == -1 {
		return false
	}
	// 得到 i
	i := curI
	curPasswird := users[i].PassWord
	users[i].PassWord = password
	userListPath := getListPath()
	// 写入文件
	fileData, err := json.Marshal(users)
	if err != nil {
		// 还原密码
		users[i].PassWord = curPasswird
		return false
	}
	err = os.WriteFile(userListPath, fileData, 0644)
	if err != nil {
		// 还原密码
		users[i].PassWord = curPasswird
		return false
	}
	return true
}

// 修改用户身份
func SetUserIdentityByUserName(username string, identity string) bool {
	users := GetList()
	// 得到 i
	curI := -1
	for i, user := range users {
		if user.UserName == username {
			curI = i
			break
		}
	}
	if curI == -1 {
		return false
	}
	// 得到 i
	i := curI
	curIdentity := users[i].Identity
	users[i].Identity = identity
	userListPath := getListPath()
	// 写入文件
	fileData, err := json.Marshal(users)
	if err != nil {
		// 还原
		users[i].Identity = curIdentity
		return false
	}
	err = os.WriteFile(userListPath, fileData, 0644)
	if err != nil {
		// 还原
		users[i].Identity = curIdentity
		return false
	}
	return true
}

// 删除用户
func DeleteUserByUserName(username string) bool {
	users := GetList()
	// 得到 i
	curI := -1
	for i, user := range users {
		if user.UserName == username {
			curI = i
			break
		}
	}
	if curI == -1 {
		// 删除失败
		return false
	}
	// 删除用户
	users = append(users[:curI], users[curI+1:]...)
	userListPath := getListPath()
	fileData, err := json.Marshal(users)
	if err != nil {
		// 删除失败
		return false
	}
	err = os.WriteFile(userListPath, fileData, 0644)
	if err != nil {
		// 删除失败
		return false
	}
	return true
}
