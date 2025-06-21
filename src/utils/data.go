package utils

import (
	"os"
	"os/exec"
	"path/filepath"
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

// 通用资源复制函数，此处用于更新机器人template
func UpdateTemplateDir(originFS string, targetFS string) error {
	return filepath.Walk(originFS, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// 获取相对于originFS的相对路径
		// 例如originFS: /resources/bin  path: /resources/bin/index.html
		// relPath: /index.html
		relPath, err := filepath.Rel(originFS, path)
		if err != nil {
			return err
		}
		// 拼接成目标地址
		dstPath := filepath.Join(targetFS, relPath)

		if info.IsDir() {
			return os.MkdirAll(dstPath, os.ModePerm)
		}

		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}

		if err := os.MkdirAll(filepath.Dir(dstPath), os.ModePerm); err != nil {
			return err
		}

		return os.WriteFile(dstPath, data, info.Mode())
	})
}
