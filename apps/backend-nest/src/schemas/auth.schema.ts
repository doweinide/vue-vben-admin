import { z } from 'zod';

import { BaseResponseSchema, TimestampSchema } from './base.schema';

// 登录请求 Schema
export const LoginRequestSchema = z.object({
  username: z
    .string()
    .min(1, '用户名不能为空')
    .describe('用户名，用于登录认证'),
  password: z.string().min(6, '密码至少6位').describe('用户密码'),
});

// 用户信息 Schema
export const UserSchema = z
  .object({
    id: z.number().describe('用户ID'),
    username: z.string().describe('用户名'),
    email: z.email().optional().describe('邮箱'),
    avatar: z.string().nullable().optional().describe('头像URL'),
    roles: z.string().describe('用户角色'),
    isActive: z.boolean().describe('是否激活'),
  })
  .extend(TimestampSchema.shape);

// 登录响应数据 Schema
export const LoginResponseDataSchema = z.object({
  access_token: z.string().describe('JWT访问令牌'),
  user: UserSchema,
});

// 登录响应 Schema
export const LoginResponseSchema = BaseResponseSchema.extend({
  data: LoginResponseDataSchema,
});

// 注册请求 Schema
export const RegisterRequestSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少3位')
    .max(20, '用户名最多20位')
    .describe('用户名'),
  password: z
    .string()
    .min(6, '密码至少6位')
    .max(50, '密码最多50位')
    .describe('密码'),
  email: z.string().email('邮箱格式不正确').describe('邮箱地址'),
});

// 注册响应 Schema
export const RegisterResponseSchema = BaseResponseSchema.extend({
  data: UserSchema,
});

// 刷新令牌请求 Schema
export const RefreshTokenRequestSchema = z.object({
  refresh_token: z.string().min(1, '刷新令牌不能为空').describe('刷新令牌'),
});

// 刷新令牌响应数据 Schema
export const RefreshTokenResponseDataSchema = z.object({
  access_token: z.string().describe('新的JWT访问令牌'),
  refresh_token: z.string().describe('新的刷新令牌'),
});

// 刷新令牌响应 Schema
export const RefreshTokenResponseSchema = BaseResponseSchema.extend({
  data: RefreshTokenResponseDataSchema,
});

// 修改密码请求 Schema
export const ChangePasswordRequestSchema = z
  .object({
    oldPassword: z.string().min(1, '原密码不能为空').describe('原密码'),
    newPassword: z
      .string()
      .min(6, '新密码至少6位')
      .max(50, '新密码最多50位')
      .describe('新密码'),
    confirmPassword: z.string().min(1, '确认密码不能为空').describe('确认密码'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '新密码和确认密码不匹配',
    path: ['confirmPassword'],
  });

// 修改密码响应 Schema
export const ChangePasswordResponseSchema = BaseResponseSchema;

// 导出类型
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type User = z.infer<typeof UserSchema>;
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
