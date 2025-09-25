package db

import (
	"alemongo/src/settings"
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var globalDB *gorm.DB

func Get() *gorm.DB {
	return globalDB
}

// Init initializes database connection according to settings.Conf.DB
func Init() error {
	dbc := settings.Conf.DB
	if dbc == nil || dbc.Driver == "" {
		// Fill defaults (should already be done in settings.fillDefaults) but guard anyway
		// fallback to internal sqlite (NOT enforced failure)
		settings.FillDefaultsIfNeeded() // helper we'll add below
		dbc = settings.Conf.DB
	}

	var dial gorm.Dialector
	switch dbc.Driver {
	case "sqlite", "sqlite3":
		path := dbc.SQLitePath
		if path == "" {
			path = "work/data/alemongo.db"
		}
		// ensure dir exists
		if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
			return err
		}
		dial = sqliteDialector(path) // 通过 build tag 选择 cgo 或 pure go 实现
	case "mysql":
		if dbc.DSN == "" {
			return errors.New("database.dsn is required for mysql")
		}
		dial = mysql.Open(dbc.DSN)
	case "postgres", "postgresql":
		if dbc.DSN == "" {
			return errors.New("database.dsn is required for postgres")
		}
		dial = postgres.Open(dbc.DSN)
	default:
		return fmt.Errorf("unsupported database driver: %s", dbc.Driver)
	}

	gdb, err := gorm.Open(dial, &gorm.Config{Logger: logger.Default.LogMode(logger.Warn)})
	if err != nil {
		// fallback: try embedded sqlite once when primary failed (unless already sqlite)
		if dbc.Driver != "sqlite" && dbc.Driver != "sqlite3" {
			fallbackPath := "work/data/alemongo.db"
			_ = os.MkdirAll(filepath.Dir(fallbackPath), 0755)
			if fb, e2 := gorm.Open(sqliteDialector(fallbackPath), &gorm.Config{Logger: logger.Default.LogMode(logger.Warn)}); e2 == nil {
				globalDB = fb
				return nil
			}
		}
		return err
	}
	globalDB = gdb
	return nil
}

// Helper to allow calling default filler from here without import cycle risk
// (implemented in settings via an exported small wrapper)
// (reserved helper removed: previous isSameHost was unused)
