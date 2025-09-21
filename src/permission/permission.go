package permission

import "strings"

// 定义权限类型和权限值
const (
	// 使用 16位 以上作为权限类型的标志位
	UserPermissionType      = 1 << 16 // 用户相关权限类型
	BotPermissionType       = 2 << 16 // 机器人相关权限类型
	BotConfigPermissionType = 3 << 16 // 机器人配置相关权限类型
	SSHPermissionType       = 4 << 16 // SSH相关权限类型
	SystemConfigType        = 5 << 16 // 系统配置相关权限类型
	PublicPermissionType    = 6 << 16 // 公共接口权限类型

	// 用户相关权限
	UserCreate = UserPermissionType | (1 << 0) // 创建用户
	UserRead   = UserPermissionType | (1 << 1) // 查看用户
	UserUpdate = UserPermissionType | (1 << 2) // 修改用户
	UserDelete = UserPermissionType | (1 << 3) // 删除用户

	// 机器人相关权限
	BotCreate  = BotPermissionType | (1 << 0) // 创建机器人
	BotRead    = BotPermissionType | (1 << 1) // 查看机器人
	BotUpdate  = BotPermissionType | (1 << 2) // 修改机器人
	BotDelete  = BotPermissionType | (1 << 3) // 删除机器人
	BotControl = BotPermissionType | (1 << 4) // 机器人运行控制

	// 机器人配置相关权限
	BotConfigCreate  = BotConfigPermissionType | (1 << 0) // 创建配置
	BotConfigRead    = BotConfigPermissionType | (1 << 1) // 查看配置
	BotConfigUpdate  = BotConfigPermissionType | (1 << 2) // 修改配置
	BotConfigDelete  = BotConfigPermissionType | (1 << 3) // 删除配置
	BotPackageManage = BotConfigPermissionType | (1 << 4) // 包管理
	BotGitManage     = BotConfigPermissionType | (1 << 5) // Git操作
	BotLogManage     = BotConfigPermissionType | (1 << 6) // 日志管理

	// SSH相关权限
	SSHCreate = SSHPermissionType | (1 << 0) // 创建SSH密钥
	SSHRead   = SSHPermissionType | (1 << 1) // 查看SSH密钥
	SSHUpdate = SSHPermissionType | (1 << 2) // 修改SSH密钥
	SSHDelete = SSHPermissionType | (1 << 3) // 删除SSH密钥

	// 系统配置相关权限
	SystemConfigRead     = SystemConfigType | (1 << 0) // 查看系统配置
	SystemConfigUpdate   = SystemConfigType | (1 << 1) // 修改系统配置
	SystemSettingsManage = SystemConfigType | (1 << 2) // 系统设置管理

	// 公共接口权限
	PublicRead = PublicPermissionType | (1 << 0) // 公共信息查看
)

const (
	// 管理权限组合
	UserManage         = UserCreate | UserRead | UserUpdate | UserDelete                                                                      // 用户管理权限
	BotManage          = BotCreate | BotRead | BotUpdate | BotDelete | BotControl                                                             // 机器人管理权限
	BotConfigManage    = BotConfigCreate | BotConfigRead | BotConfigUpdate | BotConfigDelete | BotPackageManage | BotGitManage | BotLogManage // 机器人配置管理权限
	SSHManage          = SSHCreate | SSHRead | SSHUpdate | SSHDelete                                                                          // SSH管理权限
	SystemConfigManage = SystemConfigRead | SystemConfigUpdate | SystemSettingsManage                                                         // 系统配置管理权限
)

// 角色定义：超级管理员、管理员、运维人员、运营人员、开发人员、普通成员、访客

// 定义角色权限
const (
	// 访客: 只读权限
	Guest = BotRead | BotConfigRead | UserRead | SSHRead | SystemConfigRead | PublicRead
	// 普通成员: 可以创建和修改机器人，但不能删除机器人和SSH密钥
	Member = BotCreate | BotRead | BotUpdate | BotControl | BotConfigCreate | BotConfigRead | BotConfigUpdate | BotPackageManage | BotGitManage | BotLogManage | SSHCreate | SSHRead | SSHUpdate | UserRead | SystemConfigRead | PublicRead
	// 开发人员: 可以管理机器人和配置，但不能删除机器人和SSH密钥
	Developer = BotCreate | BotRead | BotUpdate | BotControl | BotConfigCreate | BotConfigRead | BotConfigUpdate | BotConfigDelete | BotPackageManage | BotGitManage | BotLogManage | SSHCreate | SSHRead | SSHUpdate | UserRead | SystemConfigRead | PublicRead
	// 运营人员: 只能查看机器人和配置信息，不能进行修改操作
	Operator = BotRead | BotConfigRead | UserRead | SSHRead | SystemConfigRead | PublicRead
	// 运维人员: 可以管理机器人和配置，但不能修改用户身份和系统配置
	DevOps = BotManage | BotConfigManage | SSHManage | UserRead | SystemConfigRead | PublicRead
	// 管理员: 可以管理机器人和配置，可以创建用户，但不能删除用户
	Admin = BotManage | BotConfigManage | SSHManage | UserCreate | UserRead | UserUpdate | SystemConfigManage | PublicRead
	// 超级管理员: 拥有所有权限
	SuperAdmin = UserManage | BotManage | BotConfigManage | SSHManage | SystemConfigManage | PublicRead
)

// 定义身份标识
const (
	IdentitySuperAdmin = "super_admin" // 超级管理员
	IdentityAdmin      = "admin"       // 管理员
	IdentityDevOps     = "devops"      // 运维人员
	IdentityOperator   = "operator"    // 运营人员
	IdentityDeveloper  = "developer"   // 开发人员
	IdentityMember     = "member"      // 普通成员
	IdentityGuest      = "guest"       // 访客
)

// 角色权限映射
var RolePermissions = map[string]int{
	IdentitySuperAdmin: SuperAdmin,
	IdentityAdmin:      Admin,
	IdentityDevOps:     DevOps,
	IdentityOperator:   Operator,
	IdentityDeveloper:  Developer,
	IdentityMember:     Member,
	IdentityGuest:      Guest,
}

// 将 RolePermissions 的键提取为数组
var Identities = func() []string {
	keys := make([]string, 0, len(RolePermissions))
	for key := range RolePermissions {
		keys = append(keys, key)
	}
	return keys
}()

// 是否存在指定身份标识
func ExistIdentity(identity string) bool {
	exist := false
	for _, id := range Identities {
		if strings.EqualFold(id, identity) {
			exist = true
			break
		}
	}
	return exist
}

// 得到权限数组
var PermissionNames = []int{
	// 用户权限
	UserCreate,
	UserRead,
	UserUpdate,
	UserDelete,
	UserManage,
	// 机器人权限
	BotCreate,
	BotRead,
	BotUpdate,
	BotDelete,
	BotControl,
	BotManage,
	// 机器人配置权限
	BotConfigCreate,
	BotConfigRead,
	BotConfigUpdate,
	BotConfigDelete,
	BotPackageManage,
	BotGitManage,
	BotLogManage,
	BotConfigManage,
	// SSH权限
	SSHCreate,
	SSHRead,
	SSHUpdate,
	SSHDelete,
	SSHManage,
	// 系统配置权限
	SystemConfigRead,
	SystemConfigUpdate,
	SystemSettingsManage,
	SystemConfigManage,
	// 公共权限
	PublicRead,
}

// 默认超级管理员用户名
const (
	DefaultUserName = "lemonade" // 超级管理默认名
)

// 输入身份标识，返回对应的权限
func GetPermissionsByIdentity(identity string) int {
	// 如果身份标识不存在，则返回 0
	if permissions, ok := RolePermissions[identity]; ok {
		return permissions
	}
	// 如果身份标识不存在，则返回 0
	return 0
}

// 校验用户是否拥有指定权限
func CheckPermission(userPermissions int, requiredPermission int) bool {
	// 如果用户权限包含所需权限，则返回 true
	return (userPermissions & requiredPermission) == requiredPermission
}

// 指定身份标识是否有拥有指定权限
func CheckIdentityPermission(identity string, requiredPermission int) bool {
	// 获取身份标识对应的权限
	permissions := GetPermissionsByIdentity(identity)
	// 校验权限
	return CheckPermission(permissions, requiredPermission)
}

// 输入身份标识，返回 权限值:是否拥有该权限
func GetPermissionsByIdentityMap(identity string) map[int]bool {
	// 获取身份标识对应的权限
	permissions := GetPermissionsByIdentity(identity)
	// 创建一个 map 来存储权限名和是否拥有该权限
	permissionMap := make(map[int]bool)

	// 遍历所有权限，检查用户是否拥有该权限
	for _, permission := range PermissionNames {
		// 检查用户是否拥有该权限
		if CheckPermission(permissions, permission) {
			// 如果拥有该权限，则将其添加到 map 中
			permissionMap[permission] = true
		} else {
			// 如果不拥有该权限，则将其添加到 map 中
			permissionMap[permission] = false
		}
	}

	return permissionMap
}
