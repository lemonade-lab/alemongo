package dao

import (
	"alemongo/src/dao/db"
	"alemongo/src/models"
	"alemongo/src/permission"
	"alemongo/src/pkgs/email"
	passwordpkg "alemongo/src/pkgs/password"
	"alemongo/src/settings"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"sync"
	"time"
)

// requireDB 确保数据库已初始化
func requireDB() {
	if db.Get() == nil {
		log.Panic("database not initialized: SQL storage is now mandatory")
	}
}

// 管理员账户（内存临时）
var admin *models.User

// 登录失败缓存：简单防爆破
var loginFailures = sync.Map{} // key: username, value: {count, lastFailedTime}

// InitAdmin 可能生成临时超级管理员
func InitAdmin() { admin = GenerateAdminAccount() }

// HasSuperAdmin 是否已有永久超级管理员
func HasSuperAdmin() bool {
	requireDB()
	var c int64
	if err := db.Get().Model(&db.UserDO{}).Where("identity = ?", permission.IdentitySuperAdmin).Count(&c).Error; err != nil {
		return false
	}
	return c > 0
}

// GetSuperAdmin 获取超级管理员
func GetSuperAdmin() (models.User, bool) {
	requireDB()
	var udb db.UserDO
	if err := db.Get().Where("identity = ?", permission.IdentitySuperAdmin).First(&udb).Error; err != nil {
		return models.User{}, false
	}
	return db.ToUserModel(&udb), true
}

// IsTemporarySuperAdmin 判断是否为尚未持久化的临时超级管理员
func IsTemporarySuperAdmin(username string) bool {
	return !HasSuperAdmin() && username == admin.UserName
}

// GetSuperAdminStatus 超级管理员状态
func GetSuperAdminStatus(username string) map[string]interface{} {
	s := map[string]interface{}{"is_temporary": IsTemporarySuperAdmin(username), "username": username, "has_permanent": HasSuperAdmin()}
	if IsTemporarySuperAdmin(username) {
		s["message"] = "当前为临时超级管理员，请修改密码以永久保存账户"
	} else {
		s["message"] = "超级管理员账户已永久保存"
	}
	return s
}

// GetAdmin 返回 admin 副本
func GetAdmin() *models.User { c := *admin; return &c }

// generateRandomPassword 随机密码
func generateRandomPassword(n int) string {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "defaultPassword123"
	}
	return base64.URLEncoding.EncodeToString(b)[:n]
}

// GenerateAdminAccount 生成或获取临时管理员
func GenerateAdminAccount() *models.User {
	uname := permission.DefaultUserName
	if HasSuperAdmin() {
		if u, ok := GetUserByUserName(uname); ok && u.Identity == permission.IdentitySuperAdmin {
			return &u
		}
	}
	pwd := generateRandomPassword(16)
	u := &models.User{Identity: permission.IdentitySuperAdmin, UserName: uname, PassWord: pwd, MasterName: permission.DefaultUserName, Email: settings.Conf.SMTP.FromEmail, IsEmailVerified: true, ReceiveEmailNotification: false}
	log.Printf("临时超级管理员账户信息：\n账户: %s\n密码: %s\n", u.UserName, u.PassWord)
	log.Printf("请使用此账户登录并修改密码，修改密码后账户将永久保存")
	return u
}

// SetAdminPassword 设置/保存超级管理员
func SetAdminPassword(newPwd string) bool {
	if newPwd == "" {
		return false
	}
	if !passwordpkg.IsHashed(newPwd) {
		if h, err := passwordpkg.HashPassword(newPwd); err == nil {
			newPwd = h
		}
	}
	if HasSuperAdmin() {
		if ok := SetUserByUserName(admin.UserName, newPwd); ok {
			admin.PassWord = newPwd
			return true
		}
		return false
	}
	u := &models.User{Identity: permission.IdentitySuperAdmin, UserName: admin.UserName, PassWord: newPwd, MasterName: permission.DefaultUserName, Email: settings.Conf.SMTP.FromEmail, IsEmailVerified: true, ReceiveEmailNotification: false}
	if err := CreateUser(u); err != nil {
		log.Printf("保存超级管理员失败: %v", err)
		return false
	}
	admin.PassWord = newPwd
	return true
}

// IsSuperAdmin 是否（临时或永久）超级管理员
func IsSuperAdmin(username string) bool {
	if u, ok := GetUserByUserName(username); ok && u.Identity == permission.IdentitySuperAdmin {
		return true
	}
	return IsTemporarySuperAdmin(username)
}

// GetList 返回所有用户
func GetList() []models.User {
	requireDB()
	var list []db.UserDO
	if err := db.Get().Find(&list).Error; err != nil {
		return []models.User{}
	}
	res := make([]models.User, 0, len(list))
	for i := range list {
		res = append(res, db.ToUserModel(&list[i]))
	}
	return res
}

// ExistUserByUserName 检查存在
func ExistUserByUserName(username string) bool {
	requireDB()
	var c int64
	if err := db.Get().Model(&db.UserDO{}).Where("user_name = ?", username).Count(&c).Error; err != nil {
		return false
	}
	return c > 0
}

// CreateUser 创建用户
func CreateUser(user *models.User) error {
	requireDB()
	if user.PassWord == "" {
		return errors.New("密码不能为空")
	}
	if !passwordpkg.IsHashed(user.PassWord) {
		h, err := passwordpkg.HashPassword(user.PassWord)
		if err != nil {
			return err
		}
		user.PassWord = h
	}
	return db.Get().Create(db.FromUserModel(user)).Error
}

// GetUserByUserName 获取用户
func GetUserByUserName(username string) (models.User, bool) {
	requireDB()
	var udb db.UserDO
	if err := db.Get().Where("user_name = ?", username).First(&udb).Error; err != nil {
		return models.User{}, false
	}
	return db.ToUserModel(&udb), true
}

// SetUserByUserName 设置密码
func SetUserByUserName(username string, newPlain string) bool {
	requireDB()
	if newPlain == "" {
		return false
	}
	hashed := newPlain
	if !passwordpkg.IsHashed(newPlain) {
		h, err := passwordpkg.HashPassword(newPlain)
		if err != nil {
			return false
		}
		hashed = h
	}
	if err := db.Get().Model(&db.UserDO{}).Where("user_name = ?", username).Update("pass_word", hashed).Error; err != nil {
		return false
	}
	return true
}

// SetUserIdentityByUserName 修改身份
func SetUserIdentityByUserName(username string, identity string) bool {
	requireDB()
	if err := db.Get().Model(&db.UserDO{}).Where("user_name = ?", username).Update("identity", identity).Error; err != nil {
		return false
	}
	return true
}

// DeleteUserByUserName 删除用户
func DeleteUserByUserName(username string) error {
	requireDB()
	if err := db.Get().Where("user_name = ?", username).Delete(&db.UserDO{}).Error; err != nil {
		return errors.New("删除失败")
	}
	return nil
}

// IsAccountLocked 是否锁定（5 次失败 5 分钟）
func IsAccountLocked(username string) (bool, int) {
	v, ok := loginFailures.Load(username)
	if !ok {
		return false, 0
	}
	d := v.(struct {
		count          int
		lastFailedTime time.Time
	})
	if d.count < 5 {
		return false, 0
	}
	elapsed := time.Since(d.lastFailedTime)
	if elapsed < 5*time.Minute {
		return true, int((5*time.Minute - elapsed).Seconds())
	}
	loginFailures.Delete(username)
	return false, 0
}

// ClearLoginFailures 清除失败记录
func ClearLoginFailures(username string) { loginFailures.Delete(username) }

// RecordLoginFailure 记录失败
func RecordLoginFailure(username string) {
	v, _ := loginFailures.LoadOrStore(username, struct {
		count          int
		lastFailedTime time.Time
	}{0, time.Now()})
	d := v.(struct {
		count          int
		lastFailedTime time.Time
	})
	d.count++
	d.lastFailedTime = time.Now()
	loginFailures.Store(username, d)
}

// ChangeUserPassword 修改密码
func ChangeUserPassword(username, oldPassword, newPassword string) error {
	requireDB()
	u, ok := GetUserByUserName(username)
	if !ok {
		return errors.New("用户不存在")
	}
	if match, _ := passwordpkg.Compare(u.PassWord, oldPassword); !match {
		return errors.New("密码错误")
	}
	if !SetUserByUserName(username, newPassword) {
		return errors.New("修改密码失败")
	}
	return nil
}

// BindEmail 绑定邮箱
func BindEmail(username, emailAddr string) error {
	requireDB()
	if IsSuperAdmin(username) {
		return errors.New("管理员无需绑定邮箱")
	}
	if _, ok := GetUserByUserName(username); !ok {
		return errors.New("用户不存在")
	}
	if err := db.Get().Model(&db.UserDO{}).Where("user_name = ?", username).Updates(map[string]interface{}{"email": emailAddr, "is_email_verified": true, "receive_email_notification": false}).Error; err != nil {
		return err
	}
	return nil
}

// EditEmailConfig 修改邮件配置
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

	// 测试配置是否有效
	sender, err := email.NewMailSender(&settings.SMTPConfig{Provider: cfg.Provider, Host: cfg.Host, Port: cfg.Port, Username: cfg.Username, Password: cfg.Password, FromEmail: cfg.From_email})
	if err != nil {
		return err
	}

	// 序列化配置为 JSON 保存到数据库
	configJSON, err := marshalEmailConfig(cfg)
	if err != nil {
		return err
	}

	if err := UpsertSetting(&models.Setting{
		Key:      "smtp_config",
		Value:    configJSON,
		Category: "email",
		Editable: true,
	}); err != nil {
		return err
	}

	// 更新内存配置和 sender
	email.Sender = sender
	log.Println("SMTP 配置已更新并保存到数据库")
	return nil
}

// GetEmailConfig 获取邮件配置（优先从数据库读取）
func GetEmailConfig() (*models.EmailConfig, error) {
	// 尝试从数据库读取
	setting, err := GetSetting("smtp_config")
	if err == nil && setting != nil && setting.Value != "" {
		cfg, err := unmarshalEmailConfig(setting.Value)
		if err == nil {
			return cfg, nil
		}
	}

	// 如果数据库中没有，返回配置文件/环境变量中的默认值
	return &models.EmailConfig{
		Provider:   settings.Conf.SMTP.Provider,
		Host:       settings.Conf.SMTP.Host,
		Port:       settings.Conf.SMTP.Port,
		Username:   settings.Conf.SMTP.Username,
		Password:   settings.Conf.SMTP.Password,
		From_email: settings.Conf.SMTP.FromEmail,
	}, nil
}

// GetUserByGitHubID 通过 GitHub ID 查找
func GetUserByGitHubID(githubID int64) (models.User, bool) {
	if githubID <= 0 {
		return models.User{}, false
	}
	requireDB()
	var udb db.UserDO
	if err := db.Get().Where("git_hub_id = ?", githubID).First(&udb).Error; err != nil {
		return models.User{}, false
	}
	return db.ToUserModel(&udb), true
}

// EditGitHubConfig 修改 GitHub OAuth 配置
func EditGitHubConfig(cfg models.GitHubConfig) error {
	if cfg.ClientID == "" {
		cfg.ClientID = settings.Conf.GitHub.ClientID
	} else {
		settings.Conf.GitHub.ClientID = cfg.ClientID
	}
	if cfg.ClientSecret == "" {
		cfg.ClientSecret = settings.Conf.GitHub.ClientSecret
	} else {
		settings.Conf.GitHub.ClientSecret = cfg.ClientSecret
	}
	if cfg.RedirectURL == "" {
		cfg.RedirectURL = settings.Conf.GitHub.RedirectURL
	} else {
		settings.Conf.GitHub.RedirectURL = cfg.RedirectURL
	}

	// 序列化配置为 JSON 保存到数据库
	configJSON, err := marshalGitHubConfig(cfg)
	if err != nil {
		return err
	}

	if err := UpsertSetting(&models.Setting{
		Key:      "github_oauth_config",
		Value:    configJSON,
		Category: "github",
		Editable: true,
	}); err != nil {
		return err
	}

	log.Println("GitHub OAuth 配置已更新并保存到数据库")
	return nil
}

// GetGitHubConfig 获取 GitHub 配置（优先从数据库读取）
func GetGitHubConfig() (*models.GitHubConfig, error) {
	// 尝试从数据库读取
	setting, err := GetSetting("github_oauth_config")
	if err == nil && setting != nil && setting.Value != "" {
		cfg, err := unmarshalGitHubConfig(setting.Value)
		if err == nil {
			return cfg, nil
		}
	}

	// 如果数据库中没有，返回配置文件/环境变量中的默认值
	return &models.GitHubConfig{
		ClientID:     settings.Conf.GitHub.ClientID,
		ClientSecret: settings.Conf.GitHub.ClientSecret,
		RedirectURL:  settings.Conf.GitHub.RedirectURL,
	}, nil
}

// IsGitHubIDBound 是否被绑定
func IsGitHubIDBound(githubID int64) bool {
	requireDB()
	var c int64
	if err := db.Get().Model(&db.UserDO{}).Where("git_hub_id = ?", githubID).Count(&c).Error; err != nil {
		return false
	}
	return c > 0
}

// BindGitHubAccount 绑定 GitHub
func BindGitHubAccount(username string, info *models.GitHubUserInfo) error {
	requireDB()
	if _, ok := GetUserByUserName(username); !ok {
		return errors.New("用户不存在")
	}
	if IsGitHubIDBound(info.ID) {
		return errors.New("该 GitHub 账号已被其他用户绑定")
	}
	upd := map[string]interface{}{"git_hub_id": info.ID, "git_hub_username": info.Login, "git_hub_avatar": info.Avatar, "is_git_hub_bound": true}
	if info.Email != "" {
		if u, ok := GetUserByUserName(username); ok && u.Email == "" {
			upd["email"] = info.Email
			upd["is_email_verified"] = true
		}
	}
	if err := db.Get().Model(&db.UserDO{}).Where("user_name = ?", username).Updates(upd).Error; err != nil {
		return err
	}
	return nil
}

// UnbindGitHubAccount 解绑 GitHub
func UnbindGitHubAccount(username string) error {
	requireDB()
	if _, ok := GetUserByUserName(username); !ok {
		return errors.New("用户不存在")
	}
	if err := db.Get().Model(&db.UserDO{}).Where("user_name = ?", username).Updates(map[string]interface{}{"git_hub_id": 0, "git_hub_username": "", "git_hub_avatar": "", "is_git_hub_bound": false}).Error; err != nil {
		return err
	}
	return nil
}

// ================ JSON 序列化辅助函数 ================

// marshalEmailConfig 将 EmailConfig 序列化为 JSON 字符串
func marshalEmailConfig(cfg models.EmailConfig) (string, error) {
	data, err := json.Marshal(cfg)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// unmarshalEmailConfig 将 JSON 字符串反序列化为 EmailConfig
func unmarshalEmailConfig(jsonStr string) (*models.EmailConfig, error) {
	var cfg models.EmailConfig
	if err := json.Unmarshal([]byte(jsonStr), &cfg); err != nil {
		return nil, err
	}
	return &cfg, nil
}

// marshalGitHubConfig 将 GitHubConfig 序列化为 JSON 字符串
func marshalGitHubConfig(cfg models.GitHubConfig) (string, error) {
	data, err := json.Marshal(cfg)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// unmarshalGitHubConfig 将 JSON 字符串反序列化为 GitHubConfig
func unmarshalGitHubConfig(jsonStr string) (*models.GitHubConfig, error) {
	var cfg models.GitHubConfig
	if err := json.Unmarshal([]byte(jsonStr), &cfg); err != nil {
		return nil, err
	}
	return &cfg, nil
}

// LoadEmailConfigFromDB 从数据库加载 Email 配置到内存
func LoadEmailConfigFromDB() {
	setting, err := GetSetting("smtp_config")
	if err != nil || setting == nil || setting.Value == "" {
		log.Println("未找到数据库中的 SMTP 配置，使用环境变量或配置文件默认值")
		return
	}

	cfg, err := unmarshalEmailConfig(setting.Value)
	if err != nil {
		log.Printf("解析数据库中的 SMTP 配置失败: %v", err)
		return
	}

	// 更新内存配置
	settings.Conf.SMTP.Provider = cfg.Provider
	settings.Conf.SMTP.Host = cfg.Host
	settings.Conf.SMTP.Port = cfg.Port
	settings.Conf.SMTP.Username = cfg.Username
	settings.Conf.SMTP.Password = cfg.Password
	settings.Conf.SMTP.FromEmail = cfg.From_email

	// 重新初始化邮件发送者
	sender, err := email.NewMailSender(settings.Conf.SMTP)
	if err != nil {
		log.Printf("使用数据库中的 SMTP 配置初始化邮件发送者失败: %v", err)
		return
	}
	email.Sender = sender
	log.Println("已从数据库加载 SMTP 配置")
}

// LoadGitHubConfigFromDB 从数据库加载 GitHub 配置到内存
func LoadGitHubConfigFromDB() {
	setting, err := GetSetting("github_oauth_config")
	if err != nil || setting == nil || setting.Value == "" {
		log.Println("未找到数据库中的 GitHub OAuth 配置，使用环境变量或配置文件默认值")
		return
	}

	cfg, err := unmarshalGitHubConfig(setting.Value)
	if err != nil {
		log.Printf("解析数据库中的 GitHub OAuth 配置失败: %v", err)
		return
	}

	// 更新内存配置
	settings.Conf.GitHub.ClientID = cfg.ClientID
	settings.Conf.GitHub.ClientSecret = cfg.ClientSecret
	settings.Conf.GitHub.RedirectURL = cfg.RedirectURL

	log.Println("已从数据库加载 GitHub OAuth 配置")
}
