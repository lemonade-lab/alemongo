package logic

import (
	"alemongo/src/utils"
	"embed"
)

func ResetTemplate(originPath embed.FS, targetPath string) error {
	return utils.UpdateTemplateDir(originPath, targetPath)
}
