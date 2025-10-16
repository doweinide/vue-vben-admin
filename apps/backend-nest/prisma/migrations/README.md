# 数据库迁移文件

此目录包含 Prisma 数据库迁移文件，用于管理数据库结构的版本控制和变更历史。

## 迁移文件说明

### 20251015092602_init

- **创建时间**: 2025-10-15 09:26:02
- **迁移类型**: 初始化迁移
- **描述**: 创建用户表的初始数据库结构

#### 包含的变更:

1. **创建 users 表**
   - `id`: 主键，自动递增整数
   - `username`: 用户名，唯一约束
   - `email`: 邮箱地址，唯一约束
   - `password`: 密码哈希值
   - `avatar`: 头像 URL（可选）
   - `isActive`: 账户状态，默认为 true
   - `roles`: 用户角色，默认为 'user'
   - `createdAt`: 创建时间，默认为当前时间
   - `updatedAt`: 更新时间

2. **创建索引**
   - `users_username_key`: 用户名唯一索引
   - `users_email_key`: 邮箱唯一索引

## 迁移管理命令

```bash
# 生成新的迁移文件
npx prisma migrate dev --name <migration_name>

# 应用迁移到数据库
npx prisma migrate deploy

# 重置数据库（开发环境）
npx prisma migrate reset

# 查看迁移状态
npx prisma migrate status
```

## 注意事项

1. **生产环境**: 在生产环境中应用迁移前，请务必备份数据库
2. **团队协作**: 迁移文件应该提交到版本控制系统，确保团队成员同步
3. **迁移顺序**: 迁移文件按时间戳顺序执行，不要手动修改已存在的迁移文件
4. **数据安全**: 删除字段或表的迁移可能导致数据丢失，请谨慎操作

## 迁移文件结构

```
migrations/
├── migration_lock.toml     # 迁移锁文件，记录数据库提供者
└── 20251015092602_init/    # 迁移文件夹
    └── migration.sql       # SQL 迁移脚本
```
