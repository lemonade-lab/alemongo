package db

// AutoMigrate runs GORM automigrations for required tables
func AutoMigrate() error {
	if Get() == nil {
		return nil
	}
	return Get().AutoMigrate(&UserDO{}, &SettingDO{}, &NotificationDO{})
}
