package utils

import (
	"os"
	"os/exec"
	"strconv"
)

// byte 转 string
func ByteToString(digits []byte) string {
	code := ""
	for _, b := range digits {
		code += string('0' + b)
	}
	return code
}

// string 转 byte
func StringToByte(code string) []byte {
	// 创建
	digits := make([]byte, len(code))
	// 将字符串表示的数字转换为字节切片
	for i, c := range code {
		num, err := strconv.Atoi(string(c))
		if err != nil {
			return nil
		}
		digits[i] = byte(num)
	}
	return digits
}

// 得到指定dir下的所有文件
func GetFileNames(dir string) ([]string, error) {
	file, err := os.Open(dir)
	if err != nil {
		return []string{}, err
	}
	defer file.Close()
	files, err := file.Readdir(-1)
	if err != nil {
		return []string{}, err
	}
	names := []string{}
	for _, f := range files {
		if !f.IsDir() {
			names = append(names, f.Name())
		}
	}
	return names, nil
}

// 得到指定dir下的所有目录名
func GetDirNames(dir string) ([]string, error) {
	file, err := os.Open(dir)
	if err != nil {
		return []string{}, err
	}
	defer file.Close()
	files, err := file.Readdir(-1)
	if err != nil {
		return []string{}, err
	}
	names := []string{}
	for _, f := range files {
		if f.IsDir() {
			names = append(names, f.Name())
		}
	}
	return names, nil
}

// Command 创建一个新的命令
func Command(name string, arg ...string) *exec.Cmd {
	cmd := exec.Command(name, arg...)
	cmd.Env = os.Environ()
	return cmd
}
