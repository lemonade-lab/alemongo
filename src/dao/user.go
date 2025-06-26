package dao

import (
	"alemongo/src/models"
	"alemongo/src/permission"
	"alemongo/src/settings"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"os"
	"path"
	"sync"
	"time"
)

// 管理员账户
var admin *models.User

// 登录失败缓存
var loginFailures = sync.Map{} // key: username, value: {count, lastFailedTime}

// todo
// 登录失败锁定后 / 登录后。之前发放出去的token都要失效

func InitAdmin() {
	admin = GenerateAdminAccount()
}

func GetAdmin() *models.User {
	adminCpy := *admin
	return &adminCpy
}

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

func GenerateAdminAccount() *models.User {
	userPath, err := settings.GetUserDataPath()
	if err != nil {
		return &models.User{}
	}
	// 检查用户数据目录是否存在
	userListPath := path.Join(userPath, "admin.json")
	if _, err := os.Stat(userListPath); os.IsNotExist(err) {
		// 生成随机密码
		password := generateRandomPassword(16)
		username := permission.DefaultUserName
		adminUser := &models.User{
			Identity:                 permission.IdentityAdmin,
			UserName:                 username,
			PassWord:                 password,
			MasterName:               permission.DefaultUserName,
			Email:                    settings.Conf.SMTP.FromEmail,
			IsEmailVerified:          true,
			ReceiveEmailNotification: false,
		}
		log.Printf("临时超级管理员账户信息：\n账户: %s\n密码: %s\n", adminUser.UserName, adminUser.PassWord)
		return adminUser
	}
	// 读取文件中存储的admin信息
	fileData, err := os.ReadFile(userListPath)
	if err != nil {
		log.Printf("读取管理员账户文件错误: %v", err)
		return &models.User{}
	}
	// 解析json
	adminUser := &models.User{}
	err = json.Unmarshal(fileData, adminUser)
	if err != nil {
		// 解析失败
		log.Printf("读取管理员账户文件错误: %v", err)
		return &models.User{}
	}
	return adminUser
}

// 更改密码
func SetAdminPassword(password string) bool {
	// 如果密码为空。返回false
	if password == "" {
		return false
	}
	// 保存到文件
	userPath, err := settings.GetUserDataPath()
	if err != nil {
		log.Printf("获取用户数据目录失败: %v", err)
		return false
	}
	userListPath := path.Join(userPath, "admin.json")
	fileData, err := json.Marshal(models.User{
		Identity:   permission.IdentityAdmin,
		UserName:   admin.UserName,
		PassWord:   password,
		MasterName: permission.DefaultUserName,
	})
	if err != nil {
		log.Printf("序列化管理员账户信息失败: %v", err)
		return false
	}
	err = os.WriteFile(userListPath, fileData, 0644)
	if err != nil {
		log.Printf("写入管理员账户信息失败: %v", err)
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
	userPath, err := settings.GetUserDataPath()
	if err != nil {
		log.Printf("获取用户数据目录失败: %v", err)
		return ""
	}
	userListPath := path.Join(userPath, "list.json")
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
		// todo
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
func CreateUser(user *models.User) error {
	users := GetList()
	// 创建用户
	users = append(users, *user)
	userListPath := getListPath()
	fileData, err := json.Marshal(users)
	if err == nil {
		err = os.WriteFile(userListPath, fileData, 0644)
		if err == nil {
			return nil
		}
	}
	// 失败了，删除用户
	users = users[:len(users)-1]
	fileData, err = json.Marshal(users)
	if err == nil {
		err = os.WriteFile(userListPath, fileData, 0644)
		if err == nil {
			return nil
		}
	}
	return err
}

func GetUserByUserName(username string) (models.User, bool) {
	users := GetList()
	for _, user := range users {
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
func DeleteUserByUserName(username string) error {
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
		return errors.New("删除失败")
	}
	// 删除用户
	users = append(users[:curI], users[curI+1:]...)
	userListPath := getListPath()
	fileData, err := json.Marshal(users)
	if err != nil {
		// 删除失败
		return errors.New("删除失败")
	}
	err = os.WriteFile(userListPath, fileData, 0644)
	if err != nil {
		// 删除失败
		return errors.New("删除失败")
	}
	return nil
}

// 检查账户是否被锁定
func IsAccountLocked(username string) (bool, int) {
	value, ok := loginFailures.Load(username)
	if !ok {
		return false, 0
	}

	data := value.(struct {
		count          int
		lastFailedTime time.Time
	})

	// 如果失败次数小于 5 次，不锁定
	if data.count < 5 {
		return false, 0
	}

	// 检查是否超过 5 分钟
	elapsed := time.Since(data.lastFailedTime)
	if elapsed < 5*time.Minute {
		remainingTime := int((5*time.Minute - elapsed).Seconds())
		return true, remainingTime
	}

	// 超过 5 分钟，清除记录
	loginFailures.Delete(username)
	return false, 0
}

// 清除登录失败记录
func ClearLoginFailures(username string) {
	loginFailures.Delete(username)
}

// 记录登录失败
func RecordLoginFailure(username string) {
	value, _ := loginFailures.LoadOrStore(username, struct {
		count          int
		lastFailedTime time.Time
	}{0, time.Now()})

	data := value.(struct {
		count          int
		lastFailedTime time.Time
	})
	data.count++
	data.lastFailedTime = time.Now()
	loginFailures.Store(username, data)
}

func ChangePassword(username, oldPassword, newPassword string) error {
	// 是否是超级管理员
	if IsSuperAdmin(username) {
		admin := GetAdmin()
		if oldPassword != admin.PassWord {
			return errors.New("密码错误")
		}
		// 修改密码
		ok := SetAdminPassword(newPassword)
		if !ok {
			return errors.New("修改密码失败")
		}
	} else {
		user, exist := GetUserByUserName(username)
		if !exist {
			return errors.New("用户不存在")
		}
		if oldPassword != user.PassWord {
			return errors.New("密码错误")
		}
		// 修改密码
		ok := SetUserByUserName(username, newPassword)
		if !ok {
			return errors.New("修改密码失败")
		}
	}
	return nil
}

func BindEmail(username, email string) error {
	if IsSuperAdmin(username) {
		return errors.New("管理员无需绑定邮箱")
	}
	user, ok := GetUserByUserName(username)
	if !ok {
		return errors.New("用户不存在")
	}
	user.Email = email
	user.IsEmailVerified = true
	user.ReceiveEmailNotification = false
	return nil
}
