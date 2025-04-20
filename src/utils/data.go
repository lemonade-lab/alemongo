package utils

import (
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
