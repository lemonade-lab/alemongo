package dao

import (
    "alemongo/src/dao/db"
    passwordpkg "alemongo/src/pkgs/password"
    "log"
)

// MigratePlaintextPasswords 扫描 users 表内仍为明文(非 bcrypt) 的密码并批量哈希更新。
// 返回 (处理总数, 成功更新数, 失败数, error)
// 设计为幂等：已哈希的记录跳过，不会重复处理。
func MigratePlaintextPasswords() (int, int, int, error) {
    if db.Get() == nil { // 未初始化数据库直接跳过
        return 0, 0, 0, nil
    }
    var users []db.UserDO
    if err := db.Get().Find(&users).Error; err != nil {
        return 0, 0, 0, err
    }
    total := 0
    updated := 0
    failed := 0
    for _, u := range users {
        total++
        if passwordpkg.IsHashed(u.PassWord) || u.PassWord == "" { // 已处理或空值跳过
            continue
        }
        hashed, err := passwordpkg.HashPassword(u.PassWord)
        if err != nil {
            failed++
            log.Printf("password migrate: hash failed for user=%s: %v", u.UserName, err)
            continue
        }
        if err := db.Get().Model(&db.UserDO{}).Where("id = ? AND pass_word = ?", u.ID, u.PassWord).Update("pass_word", hashed).Error; err != nil {
            failed++
            log.Printf("password migrate: update failed for user=%s: %v", u.UserName, err)
            continue
        }
        updated++
    }
    if updated > 0 {
        log.Printf("password migrate: total=%d updated=%d failed=%d", total, updated, failed)
    } else {
        log.Printf("password migrate: no plaintext password found (total scanned=%d)", total)
    }
    return total, updated, failed, nil
}
