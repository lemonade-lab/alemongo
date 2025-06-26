package gitssh

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/logic"
	"alemongo/src/models"
	"github.com/gin-gonic/gin"
	"net/http"
)

/*
 ssh-keygen
	-t 指定密钥类型
	-b 指定密钥长度(仅对rsa/dsa有效)
	-C 添加注释，一般用于邮箱
	-f 指定密钥文件保存路径(默认~/.ssh/id_rsa等)
	-N 设置私钥密钥
	-q 安静模式， 执行时不输出提示信息
	-y 从私钥生成公钥
	-p 修改现有的私钥密码
	-e 将OpenSSH公钥转换为RFC4716格式
	-m 指定密钥格式：如PEM、EFC4716等
	-l 显示密钥指纹
	-E 使用特定的哈希算法生成指纹
	-A 批量生成主机密钥(常用于服务器)
*/

func GenerateSSH(c *gin.Context) {
	var req models.SSHReq

	if err := c.ShouldBind(&req); err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "参数有误")
		return
	}

	// 生成ssh-keygen指令指令获取到公钥
	pubKey, err := logic.GenerateSSH(&req)
	if err != nil {
		response.ResponseErrorWithMsg(c, http.StatusBadRequest, http.StatusBadRequest, "生成公钥失败")
		return
	}

	response.ResponseSuccessWithMsg(c, pubKey, "生成公钥成功")
}
