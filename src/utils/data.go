package utils

import (
	"embed"
	"errors"
	"io/fs"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

var ResourcesFS embed.FS

func SetFS(f embed.FS) {
	ResourcesFS = f
}

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

// 通用资源复制函数，此处用于更新机器人template
func UpdateTemplateDir(originFS embed.FS, targetFS string) error {
	return fs.WalkDir(originFS, ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		filePath := strings.TrimPrefix(path, "resources")
		dstPath := filepath.Join(targetFS, filePath)

		if d.IsDir() {
			return os.MkdirAll(dstPath, os.ModePerm)
		}

		data, err := fs.ReadFile(originFS, path)
		if err != nil {
			return err
		}

		if err := os.MkdirAll(filepath.Dir(dstPath), os.ModePerm); err != nil {
			return errors.New("更新模板文件失败")
		}

		return os.WriteFile(dstPath, data, os.ModePerm)
	})
}
