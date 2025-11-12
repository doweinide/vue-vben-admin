import { zPro as z } from '@/utils/zod/z-enhanced';

import {
  createPaginatedResponseSchema,
  createResponseSchema,
  createSchema,
} from '../base/base.schema';

/**
 * 用户基础信息 Schema（包含密码，仅用于内部处理）
 * 基于 User 数据库模型定义
 */
export const UserWithPasswordSchema = createSchema(
  z.object({
    // / 用户唯一标识符，使用 CUID 作为主键
    id: z.string().describe('用户唯一标识符，使用 CUID 作为主键'),
    // / 用户名，必须唯一，用于登录认证
    username: z
      .string()
      .min(1)
      .max(50)
      .describe('用户名，必须唯一，用于登录认证'),
    // / 用户邮箱地址，必须唯一，可用于找回密码等功能
    email: z
      .email()
      .max(100)
      .describe('用户邮箱地址，必须唯一，可用于找回密码等功能'),
    // / 用户密码，存储加密后的密码哈希值
    password: z.string().max(255).describe('用户密码，存储加密后的密码哈希值'),
    // / 用户真实姓名
    name: z.string().max(50).optional().nullable().describe('用户真实姓名'),
    // / 用户头像 URL，可选字段，用于显示用户头像
    avatar: z
      .string()
      .max(500)
      .optional()
      .nullable()
      .describe('用户头像 URL，可选字段，用于显示用户头像'),
    // / 所属部门ID
    deptId: z.string().optional().nullable().describe('所属部门ID'),
    // / 用户账户状态：0-禁用，1-启用
    status: z
      .number()
      .int()
      .min(0)
      .max(1)
      .default(1)
      .describe('用户账户状态：0-禁用，1-启用'),
    // / 用户创建时间，自动设置为当前时间
    createdAt: z.date().describe('用户创建时间，自动设置为当前时间'),
    // / 用户信息最后更新时间，每次更新时自动更新
    updatedAt: z.date().describe('用户信息最后更新时间，每次更新时自动更新'),
  }),
  'UserWithPassword',
  '用户基础信息（包含密码）',
);

/**
 * 用户响应信息 Schema（不包含密码，用于API响应）
 * 基于 User 数据库模型定义
 */
export const UserSchema = createSchema(
  z.object({
    // / 用户唯一标识符，使用 CUID 作为主键
    id: z.string().describe('用户唯一标识符，使用 CUID 作为主键'),
    // / 用户名，必须唯一，用于登录认证
    username: z
      .string()
      .min(1)
      .max(50)
      .describe('用户名，必须唯一，用于登录认证'),
    // / 用户邮箱地址，必须唯一，可用于找回密码等功能
    email: z
      .email()
      .max(100)
      .describe('用户邮箱地址，必须唯一，可用于找回密码等功能'),
    // / 用户真实姓名
    name: z.string().max(50).optional().nullable().describe('用户真实姓名'),
    // / 用户头像 URL，可选字段，用于显示用户头像
    avatar: z
      .string()
      .max(500)
      .optional()
      .nullable()
      .describe('用户头像 URL，可选字段，用于显示用户头像'),
    // / 所属部门ID
    deptId: z.string().optional().nullable().describe('所属部门ID'),
    // / 用户账户状态：0-禁用，1-启用
    status: z
      .number()
      .int()
      .min(0)
      .max(1)
      .default(1)
      .describe('用户账户状态：0-禁用，1-启用'),
    // / 用户创建时间，自动设置为当前时间
    createdAt: z.date().describe('用户创建时间，自动设置为当前时间'),
    // / 用户信息最后更新时间，每次更新时自动更新
    updatedAt: z.date().describe('用户信息最后更新时间，每次更新时自动更新'),

    // 关联数据
    // / 所属部门信息
    department: z
      .object({
        // / 部门唯一标识
        id: z.string().describe('部门唯一标识'),
        // / 部门名称
        name: z.string().max(100).describe('部门名称'),
        // / 父级部门ID，支持树形结构
        pid: z
          .string()
          .optional()
          .nullable()
          .describe('父级部门ID，支持树形结构'),
        // / 部门状态：0-禁用，1-启用
        status: z
          .number()
          .int()
          .min(0)
          .max(1)
          .describe('部门状态：0-禁用，1-启用'),
        // / 备注信息
        remark: z.string().optional().nullable().describe('备注信息'),
        // / 创建时间
        createTime: z.date().describe('创建时间'),
        // / 更新时间
        updateTime: z.date().describe('更新时间'),
      })
      .optional()
      .nullable()
      .describe('所属部门信息'),

    // / 用户角色关联（多对多）
    userRoles: z
      .array(
        z.object({
          // / 关联记录唯一标识
          id: z.string().describe('关联记录唯一标识'),
          // / 用户ID
          userId: z.string().describe('用户ID'),
          // / 角色ID
          roleId: z.string().describe('角色ID'),
          // / 分配时间
          assignedAt: z.date().describe('分配时间'),
          // / 分配者ID（可选，记录是谁分配的角色）
          assignedBy: z
            .string()
            .optional()
            .nullable()
            .describe('分配者ID（可选，记录是谁分配的角色）'),
          // / 关联的角色信息
          role: z
            .object({
              // / 角色唯一标识
              id: z.string().describe('角色唯一标识'),
              // / 角色名称（唯一）
              name: z.string().max(100).describe('角色名称（唯一）'),
              // / 角色状态：0-禁用，1-启用
              status: z
                .number()
                .int()
                .min(0)
                .max(1)
                .describe('角色状态：0-禁用，1-启用'),
              // / 备注信息
              remark: z.string().optional().nullable().describe('备注信息'),
              // / 创建时间
              createTime: z.date().describe('创建时间'),
              // / 更新时间
              updateTime: z.date().describe('更新时间'),
            })
            .optional()
            .describe('关联的角色信息'),
        }),
      )
      .optional()
      .describe('用户角色关联（多对多）'),
  }),
  'User',
  '用户信息（不包含密码）',
);

/**
 * 创建用户请求 Schema
 * 用于验证创建用户时的请求数据
 */
export const CreateUserRequestSchema = createSchema(
  z.object({
    // / 用户名，必须唯一，用于登录认证
    username: z
      .string()
      .min(3, '用户名至少3位')
      .max(50, '用户名最多50位')
      .describe('用户名，必须唯一，用于登录认证'),
    // / 用户邮箱地址，必须唯一，可用于找回密码等功能
    email: z
      .email('邮箱格式不正确')
      .max(100, '邮箱最多100位')
      .describe('用户邮箱地址，必须唯一，可用于找回密码等功能'),
    // / 用户密码，存储加密后的密码哈希值
    password: z
      .string()
      .min(6, '密码至少6位')
      .max(255, '密码最多255位')
      .describe('用户密码，存储加密后的密码哈希值'),
    // / 用户真实姓名
    name: z
      .string()
      .max(50, '姓名最多50位')
      .optional()
      .describe('用户真实姓名'),
    // / 用户头像 URL，可选字段，用于显示用户头像
    avatar: z
      .string()
      .max(500, '头像URL最多500位')
      .optional()
      .describe('用户头像 URL，可选字段，用于显示用户头像'),
    // / 所属部门ID
    deptId: z.string().optional().describe('所属部门ID'),
    // / 用户账户状态：0-禁用，1-启用
    status: z
      .number()
      .int()
      .min(0, '状态值必须为0或1')
      .max(1, '状态值必须为0或1')
      .default(1)
      .describe('用户账户状态：0-禁用，1-启用'),
    roleIds: z.array(z.string()).optional().describe('角色ID列表'),
  }),
  'CreateUserRequest',
  '创建用户请求',
);

/**
 * 更新用户请求 Schema
 * 用于验证更新用户时的请求数据
 */
export const UpdateUserRequestSchema = createSchema(
  z.object({
    // / 用户名，必须唯一，用于登录认证
    username: z
      .string()
      .min(3, '用户名至少3位')
      .max(50, '用户名最多50位')
      .optional()
      .describe('用户名，必须唯一，用于登录认证'),
    // / 用户邮箱地址，必须唯一，可用于找回密码等功能
    email: z
      .email('邮箱格式不正确')
      .max(100, '邮箱最多100位')
      .optional()
      .describe('用户邮箱地址，必须唯一，可用于找回密码等功能'),
    // / 用户密码，存储加密后的密码哈希值
    password: z
      .string()
      .min(6, '密码至少6位')
      .max(255, '密码最多255位')
      .optional()
      .describe('用户密码，存储加密后的密码哈希值'),
    // / 用户真实姓名
    name: z
      .string()
      .max(50, '姓名最多50位')
      .optional()
      .describe('用户真实姓名'),
    // / 用户头像 URL，可选字段，用于显示用户头像
    avatar: z
      .string()
      .max(500, '头像URL最多500位')
      .optional()
      .describe('用户头像 URL，可选字段，用于显示用户头像'),
    // / 所属部门ID
    deptId: z.string().optional().describe('所属部门ID'),
    // / 用户账户状态：0-禁用，1-启用
    status: z
      .number()
      .int()
      .min(0, '状态值必须为0或1')
      .max(1, '状态值必须为0或1')
      .optional()
      .describe('用户账户状态：0-禁用，1-启用'),
    roleIds: z.array(z.string()).optional().describe('角色ID列表'),
  }),
  'UpdateUserRequest',
  '更新用户请求',
);

/**
 * 用户查询参数 Schema
 * 用于验证用户列表查询时的请求参数
 */
export const UserQuerySchema = createSchema(
  z.object({
    // / 页码，从1开始
    page: z.coerce.number().min(1).default(1).describe('页码，从1开始'),
    limit: z.coerce
      .number()
      .min(1)
      .max(100)
      .default(10)
      .describe('每页数量，最大100条'),
    // / 按用户名筛选
    username: z.string().optional().describe('按用户名筛选'),
    email: z.email().optional().describe('按邮箱筛选'),
    status: z
      .number()
      .int()
      .min(0)
      .max(1)
      .optional()
      .describe('按账户状态筛选：0-禁用，1-启用'),
    deptId: z.string().optional().describe('按部门ID筛选'),
  }),
  'UserQuery',
  '用户查询参数',
);

/**
 * 用户响应 Schema
 */
export const UserResponseSchema = createResponseSchema(
  UserSchema,
  'UserResponse',
  '用户响应',
);

/**
 * 创建用户响应 Schema
 */
export const CreateUserResponseSchema = createResponseSchema(
  UserWithPasswordSchema,
  'CreateUserResponse',
  '创建用户响应',
);

/**
 * 更新用户响应 Schema
 */
export const UpdateUserResponseSchema = createResponseSchema(
  UserWithPasswordSchema,
  'UpdateUserResponse',
  '更新用户响应',
);

/**
 * 删除用户响应 Schema
 */
export const DeleteUserResponseSchema = createResponseSchema(
  z.object({
    message: z.string().describe('删除成功消息'),
  }),
  'DeleteUserResponse',
  '删除用户响应',
);

/**
 * 分页用户响应 Schema
 * 使用统一的分页响应格式，继承自 base.schema.ts 中的 PaginatedResponseSchema
 */
export const PaginatedUsersResponseSchema = createPaginatedResponseSchema(
  UserSchema,
  'PaginatedUsersResponse',
  '分页用户列表响应',
);
