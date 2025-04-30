package config

// 定义机器人权限常量
const (
	// bot
	BotCreate uint64 = 1 << iota // 0001 - 创建机器人
	BotRead                      // 0010 - 查看机器人
	BotUpdate                    // 0100 - 修改机器人
	BotDelete                    // 1000 - 删除机器人
	// user
	UserCreate
	UserRead
	UserUpdate
	UserDelete
	//
)

// 定义角色权限
const (
	Guest  = BotRead                                     // 访客：只能查看机器人
	Sub    = BotRead | BotUpdate                         // 普通用户：查看和更新机器人
	Master = BotRead | BotUpdate | BotDelete | BotDelete // 主人：查看、更新和删除机器人
	Admin  = BotRead | BotCreate | BotUpdate | BotDelete // 管理员：所有权限
)

const (
	IdentityAdmin  = "admin"
	IdentityMaster = "master"
	IdentitySub    = "sub"
	IdentityUser   = "tourist"
)

const (
	DefaultUserName = "lemonade" // 超级管理默认名
)
