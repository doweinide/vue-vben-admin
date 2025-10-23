import { z } from 'zod';

import { BaseResponseSchema } from './base.schema';

/**
 * 登录请求验证模式
 * 用户登录时提交的数据验证
 */
export const LoginRequestSchema = z.object({
  // / 用户名，用于登录认证
  username: z
    .string()
    .min(1, '用户名不能为空')
    .max(50, '用户名不能超过50个字符')
    .describe('用户名，用于登录认证'),
  // / 用户密码
  password: z
    .string()
    .min(6, '密码至少6位')
    .max(100, '密码不能超过100个字符')
    .describe('用户密码'),
});

/**
 * 用户信息验证模式（认证相关）
 * 基于 User 数据库模型定义，用于认证响应
 */
export const AuthUserSchema = z.object({
  // / 用户唯一标识符，使用 CUID 作为主键
  id: z.string().describe('用户唯一标识符，使用 CUID 作为主键'),
  // / 用户名，必须唯一，用于登录认证
  username: z.string().max(50).describe('用户名，必须唯一，用于登录认证'),
  // / 用户邮箱地址，必须唯一，可用于找回密码等功能
  email: z
    .email()
    .max(100)
    .describe('用户邮箱地址，必须唯一，可用于找回密码等功能'),
  // / 用户真实姓名
  name: z.string().max(100).optional().nullable().describe('用户真实姓名'),
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
    .describe('用户账户状态：0-禁用，1-启用'),
  // / 创建时间
  createTime: z.date().describe('创建时间'),
  // / 更新时间
  updateTime: z.date().describe('更新时间'),

  // 关联数据
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
        // / 分配人ID
        assignedBy: z.string().optional().nullable().describe('分配人ID'),
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
          .describe('关联的角色信息'),
      }),
    )
    .optional()
    .describe('用户角色关联（多对多）'),
  // / 所属部门信息
  department: z
    .object({
      // / 部门唯一标识
      id: z.string().describe('部门唯一标识'),
      // / 部门名称（唯一）
      name: z.string().max(100).describe('部门名称（唯一）'),
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
});

/**
 * 登录响应数据验证模式
 */
export const LoginResponseDataSchema = z.object({
  // / JWT访问令牌
  access_token: z.string().describe('JWT访问令牌'),
  // / 用户信息
  user: AuthUserSchema.describe('用户信息'),
});

/**
 * 登录响应验证模式
 */
export const LoginResponseSchema = BaseResponseSchema.extend({
  data: LoginResponseDataSchema,
});

/**
 * 注册请求验证模式
 */
export const RegisterRequestSchema = z.object({
  // / 用户名
  username: z
    .string()
    .min(3, '用户名至少3位')
    .max(50, '用户名最多50位')
    .describe('用户名'),
  // / 密码
  password: z
    .string()
    .min(6, '密码至少6位')
    .max(100, '密码最多100位')
    .describe('密码'),
  // / 邮箱地址
  email: z
    .string()
    .email('邮箱格式不正确')
    .max(100, '邮箱地址不能超过100个字符')
    .describe('邮箱地址'),
  // / 用户真实姓名
  name: z
    .string()
    .max(100, '姓名不能超过100个字符')
    .optional()
    .describe('用户真实姓名'),
  // / 所属部门ID
  deptId: z.string().optional().describe('所属部门ID'),
});

/**
 * 注册响应验证模式
 */
export const RegisterResponseSchema = BaseResponseSchema.extend({
  data: AuthUserSchema,
});

/**
 * 刷新令牌请求验证模式
 */
export const RefreshTokenRequestSchema = z.object({
  // / 刷新令牌
  refresh_token: z.string().min(1, '刷新令牌不能为空').describe('刷新令牌'),
});

/**
 * 刷新令牌响应数据验证模式
 */
export const RefreshTokenResponseDataSchema = z.object({
  // / 新的JWT访问令牌
  access_token: z.string().describe('新的JWT访问令牌'),
  // / 新的刷新令牌
  refresh_token: z.string().describe('新的刷新令牌'),
});

/**
 * 刷新令牌响应验证模式
 */
export const RefreshTokenResponseSchema = BaseResponseSchema.extend({
  data: RefreshTokenResponseDataSchema,
});

/**
 * 修改密码请求验证模式
 */
export const ChangePasswordRequestSchema = z
  .object({
    // / 原密码
    oldPassword: z.string().min(1, '原密码不能为空').describe('原密码'),
    // / 新密码
    newPassword: z
      .string()
      .min(6, '新密码至少6位')
      .max(100, '新密码最多100位')
      .describe('新密码'),
    // / 确认密码
    confirmPassword: z.string().min(1, '确认密码不能为空').describe('确认密码'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '新密码和确认密码不匹配',
    path: ['confirmPassword'],
  });

/**
 * 修改密码响应验证模式
 */
export const ChangePasswordResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    // / 修改成功消息
    message: z.string().describe('修改成功消息'),
  }),
});

/**
 * 获取用户信息响应验证模式
 */
export const GetUserInfoResponseSchema = BaseResponseSchema.extend({
  data: AuthUserSchema,
});

/**
 * 登出响应验证模式
 */
export const LogoutResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    // / 登出成功消息
    message: z.string().describe('登出成功消息'),
  }),
});

// 导出类型
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type LoginResponseData = z.infer<typeof LoginResponseDataSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
export type RefreshTokenResponseData = z.infer<
  typeof RefreshTokenResponseDataSchema
>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
export type ChangePasswordResponse = z.infer<
  typeof ChangePasswordResponseSchema
>;
export type GetUserInfoResponse = z.infer<typeof GetUserInfoResponseSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
