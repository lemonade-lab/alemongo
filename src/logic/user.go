package logic

import (
	"alemongo/src/dao"
	"alemongo/src/models"
	"alemongo/src/pkgs/email"
	"alemongo/src/pkgs/github"
	"alemongo/src/pkgs/jwt"
	"alemongo/src/settings"
	"alemongo/src/utils"
	"errors"
	"fmt"
	"log"
	"math/rand"
)

func CreateUser(user *models.User) error {
	if dao.IsSuperAdmin(user.UserName) {
		return errors.New("该用户已被注册")
	}
	if exist := dao.ExistUserByUserName(user.UserName); exist {
		return errors.New("该用户已被注册")
	}
	if err := dao.CreateUser(user); err != nil {
		return err
	}
	return nil
}

func DeleteUser(username string) error {
	exist := dao.ExistUserByUserName(username)
	if !exist {
		return errors.New("该用户不存在")
	}
	return dao.DeleteUserByUserName(username)
}

func GetUserInfo(username string) (*models.User, error) {
	// 首先尝试从用户列表中获取用户信息
	userInfo, exists := dao.GetUserByUserName(username)
	if exists {
		userInfo.PassWord = "******"
		return &userInfo, nil
	}

	// 如果用户列表中不存在，检查是否为临时超级管理员
	if dao.IsTemporarySuperAdmin() && username == dao.GetAdmin().UserName {
		userInfo := dao.GetAdmin()
		userInfo.PassWord = "******"

		// 为超级管理员添加状态信息
		if userInfo.ExtraInfo == nil {
			userInfo.ExtraInfo = make(map[string]interface{})
		}
		userInfo.ExtraInfo["is_temporary_super_admin"] = dao.IsTemporarySuperAdmin()

		return userInfo, nil
	}

	return nil, errors.New("用户不存在")
}

func GetUserList() []models.User {
	return dao.GetList()
}

func Login(username, password string) (string, error) {
	// 首先尝试从用户列表中获取用户信息
	user, exist := dao.GetUserByUserName(username)
	var userInfo *models.User

	if exist {
		userInfo = &user
	} else {
		// 检查是否为临时超级管理员
		if dao.IsTemporarySuperAdmin() && username == dao.GetAdmin().UserName {
			userInfo = dao.GetAdmin()
		} else {
			return "", errors.New("用户不存在")
		}
	}

	// 密码不对
	if password != userInfo.PassWord {
		//log.Printf("password: %s\n userinfo password: %s\n", password, userInfo.PassWord)
		dao.RecordLoginFailure(username)
		return "", errors.New("密码错误")
	}

	// 登录成功，清除失败记录
	dao.ClearLoginFailures(username)

	// 生成 token
	tokenValue, err := jwt.CreateToken(username)
	if err != nil {
		return "", errors.New("生成 token 失败")
	}
	return tokenValue, nil
}

func Logout(tokenValue string) error {
	return jwt.DeleteToken(tokenValue)
}

func ChangePassword(username, oldPassword, newPassword string) error {
	// 检查是否为临时超级管理员
	if dao.IsTemporarySuperAdmin() && username == dao.GetAdmin().UserName {
		// 临时超级管理员修改密码
		admin := dao.GetAdmin()
		if oldPassword != admin.PassWord {
			return errors.New("密码错误")
		}
		// 修改密码并永久保存
		ok := dao.SetAdminPassword(newPassword)
		if !ok {
			return errors.New("修改密码失败")
		}
		return nil
	}

	return dao.ChangePassword(username, oldPassword, newPassword)
}

func BindEmail(bind_email string) error {
	code := fmt.Sprintf("%06d", rand.Intn(1000000))
	utils.SetEmailCode(bind_email, code, utils.EmailExpirationTime)
	subject := "邮箱绑定验证码"
	body := "您的验证码是：" + code + "，3分钟内有效，请勿泄露。"
	return email.Sender.Send(bind_email, subject, body)
}

func VerifyEmail(username, email, code string) error {
	// 判断验证码是否正确
	cachedCode, ok := utils.GetEmailCode(email)
	if !ok {
		return errors.New("验证码已过期或无效")
	}
	if code != cachedCode {
		return errors.New("验证码错误")
	}

	// 更新用户邮箱和验证状态
	err := dao.BindEmail(username, email)
	if err != nil {
		return err
	}
	utils.DeleteEmailCode(email)
	return nil
}

func EditEmailConfig(config models.EmailConfig) error {
	return dao.EditEmailConfig(config)
}

func GetEmailConfig() (*models.EmailConfig, error) {
	config, err := dao.GetEmailConfig()
	if err != nil {
		return nil, err
	}
	if config == nil {
		return &models.EmailConfig{}, nil
	}
	return config, nil
}

// GitHubLogin GitHub 快捷登录
func GitHubLogin(code string) (string, error) {
	// 1. 用授权码换取访问令牌
	token, err := github.ExchangeCodeForToken(code)
	if err != nil {
		return "", fmt.Errorf("获取访问令牌失败: %v", err)
	}

	// 2. 获取 GitHub 用户信息
	githubUser, err := github.GetUserInfo(token.AccessToken)
	if err != nil {
		return "", fmt.Errorf("获取用户信息失败: %v", err)
	}

	// 3. 检查是否已绑定
	user, exists := dao.GetUserByGitHubID(githubUser.ID)
	if !exists {
		return "", errors.New("该 GitHub 账号未绑定任何用户，请先绑定")
	}

	// 4. 生成 JWT token
	tokenValue, err := jwt.CreateToken(user.UserName)
	if err != nil {
		return "", errors.New("生成 token 失败")
	}

	return tokenValue, nil
}

// BindGitHubAccount 绑定 GitHub 账号
func BindGitHubAccount(username, code string) error {
	// 1. 验证用户是否存在
	_, exist := dao.GetUserByUserName(username)
	if !exist {
		// 检查是否为临时超级管理员
		if !(dao.IsTemporarySuperAdmin() && username == dao.GetAdmin().UserName) {
			return errors.New("用户不存在")
		}
		log.Println("临时超级管理员用户存在")
	}

	// 2. 用授权码换取访问令牌

	token, err := github.ExchangeCodeForToken(code)
	if err != nil {
		return fmt.Errorf("获取访问令牌失败: %v", err)
	}

	// 3. 获取 GitHub 用户信息

	githubUser, err := github.GetUserInfo(token.AccessToken)
	if err != nil {
		return fmt.Errorf("获取用户信息失败: %v", err)
	}

	// 4. 绑定账号

	err = dao.BindGitHubAccount(username, githubUser)
	if err != nil {
		return err
	}

	return nil
}

// UnbindGitHubAccount 解绑 GitHub 账号
func UnbindGitHubAccount(username string) error {
	return dao.UnbindGitHubAccount(username)
}

// GetGitHubAuthURL 获取 GitHub 授权 URL
func GetGitHubAuthURL(state string) string {
	return github.GetAuthURL(state)
}

// GetGitHubConfigStatus 获取 GitHub 配置状态
func GetGitHubConfigStatus() map[string]interface{} {
	config := map[string]interface{}{
		"client_id_configured":     settings.Conf.GitHub.ClientID != "",
		"client_secret_configured": settings.Conf.GitHub.ClientSecret != "",
		"redirect_url_configured":  settings.Conf.GitHub.RedirectURL != "",
		"fully_configured":         settings.Conf.GitHub.ClientID != "" && settings.Conf.GitHub.ClientSecret != "" && settings.Conf.GitHub.RedirectURL != "",
	}
	return config
}
