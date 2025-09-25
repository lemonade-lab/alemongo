//go:build cgo

package db

// cgo 构建启用原生 sqlite3 (gorm 官方驱动, 依赖 CGO)
// 当 Docker/编译环境设置 CGO_ENABLED=1 时会使用本文件实现。

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// sqliteDialector 返回适用于当前 (cgo) 环境的 sqlite Dialector
func sqliteDialector(path string) gorm.Dialector { return sqlite.Open(path) }
