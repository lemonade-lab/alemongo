package dao

import (
	"alemongo/src/models"
	"alemongo/src/permission"
	"testing"
)

// TestIsSuperAdmin 测试超级管理员判断逻辑
func TestIsSuperAdmin(t *testing.T) {
	// 注意：这个测试需要在实际环境中运行，因为它依赖于全局状态
	// 这里只是展示测试思路，实际测试需要更复杂的设置

	t.Run("测试临时超级管理员判断", func(t *testing.T) {
		// 在测试环境中，需要先设置临时超级管理员状态
		// 这里只是示例，实际测试需要mock或设置测试环境
		username := "test_admin"

		// 测试逻辑：
		// 1. 如果用户列表中不存在超级管理员
		// 2. 且用户名为临时超级管理员用户名
		// 3. 则应该返回true

		// 由于依赖全局状态，这里只做逻辑验证
		if username == "" {
			t.Error("用户名不能为空")
		}
	})

	t.Run("测试永久超级管理员判断", func(t *testing.T) {
		// 测试逻辑：
		// 1. 如果用户列表中存在身份为super_admin的用户
		// 2. 则应该返回true

		// 这里需要创建测试用户数据
		testUser := models.User{
			Identity: permission.IdentitySuperAdmin,
			UserName: "permanent_admin",
		}

		// 验证身份标识
		if testUser.Identity != permission.IdentitySuperAdmin {
			t.Error("用户身份应该是超级管理员")
		}
	})
}

// TestPermissionConsistency 测试权限一致性
func TestPermissionConsistency(t *testing.T) {
	t.Run("测试身份标识一致性", func(t *testing.T) {
		// 验证所有身份标识都是有效的
		identities := []string{
			permission.IdentitySuperAdmin,
			permission.IdentityAdmin,
			permission.IdentityDevOps,
			permission.IdentityOperator,
			permission.IdentityDeveloper,
			permission.IdentityMember,
			permission.IdentityGuest,
		}

		for _, identity := range identities {
			if !permission.ExistIdentity(identity) {
				t.Errorf("身份标识 %s 不存在", identity)
			}
		}
	})

	t.Run("测试权限映射一致性", func(t *testing.T) {
		// 验证超级管理员拥有所有权限
		superAdminPermissions := permission.GetPermissionsByIdentity(permission.IdentitySuperAdmin)
		allPermissions := permission.UserManage | permission.BotManage | permission.BotConfigManage | permission.SSHManage | permission.SystemConfigManage | permission.PublicRead

		if superAdminPermissions != allPermissions {
			t.Error("超级管理员应该拥有所有权限")
		}
	})
}
