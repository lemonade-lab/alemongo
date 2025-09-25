//go:build !cgo

package db

// 非 cgo 构建使用 pure go 实现的 sqlite 驱动 (github.com/glebarez/sqlite)
// 这样即便设置 CGO_ENABLED=0 (例如当前 Dockerfile) 仍可正常运行。
import (
	glebarezSqlite "github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func sqliteDialector(path string) gorm.Dialector { return glebarezSqlite.Open(path) }
