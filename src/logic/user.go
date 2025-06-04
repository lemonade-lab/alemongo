package logic

import (
	"alemongo/src/dao"
	"alemongo/src/models"
	"alemongo/src/pkgs/jwt"
	"errors"
	"log"
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
		log.Printf("password: %s\n userinfo password: %s\n", password, userInfo.PassWord)
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
