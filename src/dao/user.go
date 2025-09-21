package dao

import (
	"alemongo/src/models"
	"alemongo/src/paths"
	"alemongo/src/permission"
	"alemongo/src/pkgs/email"
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

	"gopkg.in/yaml.v3"
)

// 管理员账户
var admin *models.User

// 登录失败缓存
var loginFailures = sync.Map{} // key: username, value: {count, lastFailedTime}

// 退出登录后。
// 记录 {"token":  ""}
// 如果发现是黑名单token，需要解析什么时候过期。发现过期。再从黑名单中删除。确保不会占用太多资源

func InitAdmin() {
	admin = GenerateAdminAccount()
}

// 检查是否存在超级管理员
func HasSuperAdmin() bool {
	users := GetList()
	for _, user := range users {
		if user.Identity == permission.IdentitySuperAdmin {
			return true
		}
	}
	return false
}

// 获取超级管理员用户
func GetSuperAdmin() (models.User, bool) {
	users := GetList()
	for _, user := range users {
		if user.Identity == permission.IdentitySuperAdmin {
			return user, true
		}
	}
	return models.User{}, false
}

// 检查是否为临时超级管理员（未保存到文件）
func IsTemporarySuperAdmin() bool {
	return !HasSuperAdmin()
}

// 获取超级管理员状态信息
func GetSuperAdminStatus() map[string]interface{} {
	status := map[string]interface{}{
		"is_temporary":  IsTemporarySuperAdmin(),
		"username":      admin.UserName,
		"has_permanent": HasSuperAdmin(),
	}

	if IsTemporarySuperAdmin() {
		status["message"] = "当前为临时超级管理员，请修改密码以永久保存账户"
	} else {
		status["message"] = "超级管理员账户已永久保存"
	}

	return status
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
	username := permission.DefaultUserName

	// 检查是否已存在超级管理员
	if HasSuperAdmin() {
		// 如果存在，从用户列表中获取
		existingUser, exists := GetUserByUserName(username)
		if exists && existingUser.Identity == permission.IdentitySuperAdmin {
			return &existingUser
		}
	}

	// 如果不存在超级管理员，生成临时超级管理员（不存储到文件）
	password := generateRandomPassword(16)
	adminUser := &models.User{
		Identity:                 permission.IdentitySuperAdmin,
		UserName:                 username,
		PassWord:                 password,
		MasterName:               permission.DefaultUserName,
		Email:                    settings.Conf.SMTP.FromEmail,
		IsEmailVerified:          true,
		ReceiveEmailNotification: false,
	}

	log.Printf("临时超级管理员账户信息：\n账户: %s\n密码: %s\n", adminUser.UserName, adminUser.PassWord)
	log.Printf("请使用此账户登录并修改密码，修改密码后账户将永久保存")
	return adminUser
}

// 更改密码
func SetAdminPassword(password string) bool {
	// 如果密码为空。返回false
	if password == "" {
		return false
	}

	// 检查超级管理员是否已存在于用户列表中
	if HasSuperAdmin() {
		// 如果已存在，直接更新密码
		success := SetUserByUserName(admin.UserName, password)
		if success {
			// 更新内存中的密码
			admin.PassWord = password
		}
		return success
	} else {
		// 如果不存在，创建新的超级管理员用户并保存到列表
		adminUser := &models.User{
			Identity:                 permission.IdentitySuperAdmin,
			UserName:                 admin.UserName,
			PassWord:                 password,
			MasterName:               permission.DefaultUserName,
			Email:                    settings.Conf.SMTP.FromEmail,
			IsEmailVerified:          true,
			ReceiveEmailNotification: false,
		}

		err := CreateUser(adminUser)
		if err != nil {
			log.Printf("保存超级管理员到用户列表失败: %v", err)
			return false
		}

		// 更新内存中的密码
		admin.PassWord = password
		log.Printf("超级管理员账户已永久保存到用户列表")
		return true
	}
}

// 是否是超级管理员
func IsSuperAdmin(username string) bool {
	// 检查用户名是否匹配
	if username == admin.UserName {
		return true
	}

	// 额外检查：如果用户存在于用户列表中且身份为超级管理员
	user, exists := GetUserByUserName(username)
	if exists && user.Identity == permission.IdentitySuperAdmin {
		return true
	}

	return false
}

func getListPath() string {
	userPath, err := paths.GetUserDataPath()
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
	if len(fileData) == 0 {
		// 如果文件内容为空，返回空切片
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

func EditEmailConfig(cfg models.EmailConfig) error {
	if cfg.Provider == "" {
		cfg.Provider = settings.Conf.SMTP.Provider
	} else {
		settings.Conf.SMTP.Provider = cfg.Provider
	}
	if cfg.Host == "" {
		cfg.Host = settings.Conf.SMTP.Host
	} else {
		settings.Conf.SMTP.Host = cfg.Host
	}
	if cfg.Port == 0 {
		cfg.Port = settings.Conf.SMTP.Port
	} else {
		settings.Conf.SMTP.Port = cfg.Port
	}
	if cfg.Username == "" {
		cfg.Username = settings.Conf.SMTP.Username
	} else {
		settings.Conf.SMTP.Username = cfg.Username
	}
	if cfg.Password == "" {
		cfg.Password = settings.Conf.SMTP.Password
	} else {
		settings.Conf.SMTP.Password = cfg.Password
	}
	if cfg.From_email == "" {
		cfg.From_email = settings.Conf.SMTP.FromEmail
	} else {
		settings.Conf.SMTP.FromEmail = cfg.From_email
	}

	Sender, err := email.NewMailSender(&settings.SMTPConfig{
		Provider:  cfg.Provider,
		Host:      cfg.Host,
		Port:      cfg.Port,
		Username:  cfg.Username,
		Password:  cfg.Password,
		FromEmail: cfg.From_email,
	})
	if err != nil {
		return err
	}
	email.Sender = Sender

	file, err := os.OpenFile("config.yaml", os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	//encoder := yaml.NewEncoder(file)
	//encoder.SetIndent(2)
	//
	//err = encoder.Encode(settings.Conf)
	//if err != nil {
	//	return err
	//}
	updatedConfig, err := yaml.Marshal(&settings.Conf)
	log.Println(string(updatedConfig))
	if err != nil {
		return err
	}

	err = os.WriteFile("config.yaml", updatedConfig, os.ModePerm)
	if err != nil {
		return err
	}
	log.Println("写入配置文件成功")

	return nil
}

func GetEmailConfig() (*models.EmailConfig, error) {
	emailConfig := &models.EmailConfig{
		Provider:   settings.Conf.SMTP.Provider,
		Host:       settings.Conf.SMTP.Host,
		Port:       settings.Conf.SMTP.Port,
		Username:   settings.Conf.SMTP.Username,
		Password:   settings.Conf.SMTP.Password,
		From_email: settings.Conf.SMTP.FromEmail,
	}
	return emailConfig, nil
}

// 通过 GitHub ID 查找用户
func GetUserByGitHubID(githubID int64) (models.User, bool) {
	// GitHub ID 为 0 表示未绑定，不应该匹配任何用户
	if githubID <= 0 {
		return models.User{}, false
	}

	users := GetList()
	for _, user := range users {
		if user.GitHubID == githubID {
			return user, true
		}
	}
	return models.User{}, false
}

// 检查 GitHub ID 是否已被绑定
func IsGitHubIDBound(githubID int64) bool {
	_, exists := GetUserByGitHubID(githubID)
	return exists
}

// 绑定 GitHub 账号
func BindGitHubAccount(username string, githubInfo *models.GitHubUserInfo) error {
	users := GetList()
	curI := -1
	for i, user := range users {
		if user.UserName == username {
			curI = i
			break
		}
	}
	if curI == -1 {
		return errors.New("用户不存在")
	}

	// 检查 GitHub ID 是否已被其他用户绑定
	if IsGitHubIDBound(githubInfo.ID) {
		return errors.New("该 GitHub 账号已被其他用户绑定")
	}

	// 更新用户信息
	users[curI].GitHubID = githubInfo.ID
	users[curI].GitHubUsername = githubInfo.Login
	users[curI].GitHubAvatar = githubInfo.Avatar
	users[curI].IsGitHubBound = true

	// 如果用户没有邮箱，使用 GitHub 邮箱
	if users[curI].Email == "" && githubInfo.Email != "" {
		users[curI].Email = githubInfo.Email
		users[curI].IsEmailVerified = true
	}

	userListPath := getListPath()
	fileData, err := json.Marshal(users)
	if err != nil {
		return err
	}
	err = os.WriteFile(userListPath, fileData, 0644)
	if err != nil {
		return err
	}
	return nil
}

// 解绑 GitHub 账号
func UnbindGitHubAccount(username string) error {
	users := GetList()
	curI := -1
	for i, user := range users {
		if user.UserName == username {
			curI = i
			break
		}
	}
	if curI == -1 {
		return errors.New("用户不存在")
	}

	// 清除 GitHub 绑定信息
	users[curI].GitHubID = 0
	users[curI].GitHubUsername = ""
	users[curI].GitHubAvatar = ""
	users[curI].IsGitHubBound = false

	userListPath := getListPath()
	fileData, err := json.Marshal(users)
	if err != nil {
		return err
	}
	err = os.WriteFile(userListPath, fileData, 0644)
	if err != nil {
		return err
	}
	return nil
}
