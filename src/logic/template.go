package logic

import (
	"alemongo/src/utils"
)

func ResetTemplate(originPath, targetPath string) error {
	return utils.UpdateTemplateDir("resources/template", "work/resources/template")
}
