package logic

import (
	"alemongo/src/dao"
	"alemongo/src/models"
	"alemongo/src/pkgs/email"
	"alemongo/src/pkgs/jwt"
	"alemongo/src/utils"
	"errors"
	"fmt"
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
	if dao.IsSuperAdmin(username) {
		userInfo := dao.GetAdmin()
		userInfo.PassWord = "******"
		return userInfo, nil
	}

	userInfo, exists := dao.GetUserByUserName(username)
	if !exists {
		return nil, errors.New("用户不存在")
	}
	userInfo.PassWord = "******"
	return &userInfo, nil
}

func GetUserList() []models.User {
	return dao.GetList()
}

func Login(username, password string) (string, error) {
	userInfo := &models.User{}
	if dao.IsSuperAdmin(username) {
		// 得到超级管理员信息
		userInfo = dao.GetAdmin()
	} else {
		user, exist := dao.GetUserByUserName(username)
		if !exist {
			return "", errors.New("用户不存在")
		}
		userInfo = &user
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
