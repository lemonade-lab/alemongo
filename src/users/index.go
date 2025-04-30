package users

import (
	"alemongo/src/config"
	"encoding/json"
	"os"
	"path"
)

var users Users

func getListPaht() string {
	workPath := config.GetWorkPath()
	userListPath := path.Join(workPath, "users", "list.json")
	return userListPath
}

func GetList() []User {
	userListPath := getListPaht()
	// 不存在文件。创建空文件。并返回空。
	if _, err := os.Stat(userListPath); os.IsNotExist(err) {
		// 创建文件
		file, err := os.Create(userListPath)
		if err != nil {
			return []User{}
		}
		defer file.Close()
		data := []User{}
		// 写入空数据
		_, err = json.Marshal(data)
		if err != nil {
			return []User{}
		}
	}
	// 存在文件
	fileData, err := os.ReadFile(userListPath)
	if err != nil {
		return []User{}
	}
	// 解析json
	err = json.Unmarshal(fileData, &users)
	if err != nil {
		return []User{}
	}
	// 返回用户列表
	return users
}

func GetUserByUserName(username string) (User, bool) {
	for _, user := range users {
		if user.UserName == username {
			return user, true
		}
	}
	return User{}, false
}

func SetUserByUserName(username string, password string) bool {
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
	userListPath := getListPaht()
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
	return false
}
