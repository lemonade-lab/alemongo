package users

import (
	"alemongo/src/config"
	"alemongo/src/permission"
	"encoding/json"
	"log"
	"os"
	"path"
)

func getListPath() string {
	workPath := config.GetWorkPath()
	userPath := path.Join(config.GetWorkPath(), "users")
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
		data := []User{}
		// 写入空数据
		_, err = json.Marshal(data)
		if err != nil {
		}
	}
	return userListPath
}

func GetList() []User {
	userListPath := getListPath()
	// 存在文件
	fileData, err := os.ReadFile(userListPath)
	if err != nil {
		return []User{}
	}
	// 解析json
	users := []User{}
	err = json.Unmarshal(fileData, &users)
	if err != nil {
		// tudo
		log.Println("解析json失败")
		return []User{}
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
	user := User{
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

func GetUserByUserName(username string) (User, bool) {
	users := GetList()
	for _, user := range users {
		log.Println("user.UserName:", user.UserName)
		if user.UserName == username {
			return user, true
		}
	}
	return User{}, false
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
