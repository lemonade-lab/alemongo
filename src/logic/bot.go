package logic

import (
	"alemongo/src/apps/api/response"
	"alemongo/src/dao"
)

func CreateBot(name string) (string, response.ResCode) {
	return dao.CreateBot(name)
}

func DeleteBot(name string) (string, error) {
	return dao.DeleteBot(name)
}
