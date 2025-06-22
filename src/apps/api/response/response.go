package response

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type ResponseData struct {
	RequestCode int         `json:"request_code"`
	Code        ResCode     `json:"code"`
	Msg         interface{} `json:"msg"`
	Data        interface{} `json:"data"`
}

func ResponseError(c *gin.Context, request_code int, code ResCode) {
	c.JSON(request_code, &ResponseData{
		RequestCode: request_code,
		Code:        code,
		Msg:         code.Msg(),
		Data:        nil,
	})
}

func ResponseErrorWithMsg(c *gin.Context, request_code int, code ResCode, msg interface{}) {
	c.JSON(request_code, &ResponseData{
		RequestCode: request_code,
		Code:        code,
		Msg:         msg,
		Data:        nil,
	})
}

func ResponseErrorWithData(c *gin.Context, request_code int, code ResCode, msg interface{}, data interface{}) {
	c.JSON(request_code, &ResponseData{
		RequestCode: request_code,
		Code:        code,
		Msg:         msg,
		Data:        data,
	})
}

func ResponseSuccess(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, &ResponseData{
		RequestCode: http.StatusOK,
		Code:        CodeSuccess,
		Msg:         CodeSuccess.Msg(),
		Data:        data,
	})
}

func ResponseSuccessWithMsg(c *gin.Context, data interface{}, msg interface{}) {
	c.JSON(http.StatusOK, &ResponseData{
		RequestCode: http.StatusOK,
		Code:        CodeSuccess,
		Msg:         msg,
		Data:        data,
	})
}
