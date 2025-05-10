package permission

// 定义权限类型和权限值
const (
	// 使用 16位 以上作为权限类型的标志位
	UserPermissionType   = 1 << 16 // 用户相关权限类型
	BotPermissionType    = 2 << 16 // 机器人相关权限类型
	ConfigPermissionType = 3 << 16 // 配置相关权限类型

	// 用户相关权限
	UserCreate = UserPermissionType | (1 << 0) // 创建用户
	UserRead   = UserPermissionType | (1 << 1) // 查看用户
	UserUpdate = UserPermissionType | (1 << 2) // 修改用户
	UserDelete = UserPermissionType | (1 << 3) // 删除用户

	// 机器人相关权限
	BotCreate = BotPermissionType | (1 << 0) // 创建机器人
	BotRead   = BotPermissionType | (1 << 1) // 查看机器人
	BotUpdate = BotPermissionType | (1 << 2) // 修改机器人
	BotDelete = BotPermissionType | (1 << 3) // 删除机器人

	// 配置相关权限
	ConfigRead   = ConfigPermissionType | (1 << 0) // 查看配置
	ConfigUpdate = ConfigPermissionType | (1 << 1) // 修改配置
	ConfigDelete = ConfigPermissionType | (1 << 2) // 删除配置
	ConfigCreate = ConfigPermissionType | (1 << 3) // 创建配置
)

const (
	// 管理权限
	BotManage    = BotCreate | BotRead | BotUpdate | BotDelete             // 机器人管理权限
	ConfigManage = ConfigRead | ConfigUpdate | ConfigDelete | ConfigCreate // 配置管理权限
	UserManage   = UserCreate | UserRead | UserUpdate | UserDelete         // 用户管理权限
)

// 定义角色权限
const (
	// 访客: 只读权限
	Guest = BotRead | ConfigRead | UserRead
	// 普通用户: 不能进行【用户】相关操作、【机器人】和【配置】仅能读取、更新
	Sub = BotCreate | BotRead | BotUpdate | ConfigRead | ConfigUpdate | UserRead
	// 管理员: 禁止【用户】创建、删除。
	Master = BotManage | ConfigManage | UserRead | UserUpdate
)

// 定义身份标识
const (
	IdentityAdmin  = "admin"
	IdentityMaster = "master"
	IdentitySub    = "sub"
	IdentityUser   = "tourist"
)

// 角色权限映射
var RolePermissions = map[string]int{
	IdentityMaster: Master,
	IdentitySub:    Sub,
	IdentityUser:   Guest,
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
		if id == identity {
			exist = true
			break
		}
	}
	return exist
}

// 得到权限数组
var PermissionNames = []int{
	UserCreate,
	UserRead,
	UserUpdate,
	UserDelete,
	UserManage,
	BotCreate,
	BotRead,
	BotUpdate,
	BotDelete,
	BotManage,
	ConfigRead,
	ConfigUpdate,
	ConfigDelete,
	ConfigCreate,
	ConfigManage,
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
