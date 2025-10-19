import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { PaginationSchema } from './base.schema';

// 扩展 Zod 以支持 OpenAPI
extendZodWithOpenApi(z);

// 用户角色枚举
export const UserRoleEnum = z.enum(['admin', 'user', 'moderator']);

/**
 * 用户基础信息 Schema
 */
export const UserSchema = z.object({
  id: z.number().int().positive().describe('用户唯一标识符'),
  username: z.string().min(1).describe('用户名，用于登录和显示'),
  email: z.string().email().describe('用户邮箱地址'),
  avatar: z.string().url().optional().describe('用户头像URL'),
  roles: z.array(UserRoleEnum).describe('用户角色列表'),
  isActive: z.boolean().describe('账户状态，true为激活，false为禁用'),
  createdAt: z.date().describe('账户创建时间'),
  updatedAt: z.date().describe('账户最后更新时间'),
});

/**
 * 创建用户请求 Schema
 */
export const CreateUserRequestSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少3位')
    .max(20, '用户名最多20位')
    .describe('用户名，必须唯一'),
  email: z.string().email('邮箱格式不正确').describe('用户邮箱地址，必须唯一'),
  password: z
    .string()
    .min(6, '密码至少6位')
    .max(50, '密码最多50位')
    .describe('用户密码，最少6位字符'),
  avatar: z
    .string()
    .url('头像必须是有效的URL')
    .optional()
    .describe('用户头像URL'),
  roles: z
    .array(UserRoleEnum)
    .default(['user'])
    .describe('用户角色列表，用于权限控制'),
  isActive: z.boolean().default(true).describe('是否激活'),
});

/**
 * 更新用户请求 Schema
 */
export const UpdateUserRequestSchema = z.object({
  username: z.string().min(1).optional().describe('用户名'),
  email: z.string().email().optional().describe('用户邮箱地址'),
  password: z.string().min(6).optional().describe('用户密码，最少6位字符'),
  avatar: z.string().url().optional().describe('用户头像URL'),
  roles: z.array(UserRoleEnum).optional().describe('用户角色列表'),
  isActive: z
    .boolean()
    .optional()
    .describe('用户激活状态，true为激活，false为禁用'),
});

/**
 * 用户查询参数 Schema
 */
export const UserQuerySchema = PaginationSchema.extend({
  username: z.string().optional().describe('按用户名筛选'),
  email: z.string().email().optional().describe('按邮箱筛选'),
  isActive: z.boolean().optional().describe('按激活状态筛选'),
  roles: z.string().optional().describe('按角色筛选（逗号分隔）'),
});

/**
 * 用户响应 Schema
 */
export const UserResponseSchema = UserSchema;

/**
 * 创建用户响应 Schema
 */
export const CreateUserResponseSchema = z.object({
  user: UserSchema,
  message: z.string().describe('创建成功消息'),
});

/**
 * 更新用户响应 Schema
 */
export const UpdateUserResponseSchema = z.object({
  user: UserSchema,
  message: z.string().describe('更新成功消息'),
});

/**
 * 删除用户响应 Schema
 */
export const DeleteUserResponseSchema = z.object({
  message: z.string().describe('删除成功消息'),
});

/**
 * 分页用户响应 Schema
 */
export const PaginatedUsersResponseSchema = z.object({
  data: z.array(UserSchema),
  meta: z.object({
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    totalPages: z.number().int().min(0),
  }),
});

// 导出类型
export type User = z.infer<typeof UserSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type UserQuery = z.infer<typeof UserQuerySchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;
export type DeleteUserResponse = z.infer<typeof DeleteUserResponseSchema>;
export type PaginatedUsersResponse = z.infer<
  typeof PaginatedUsersResponseSchema
>;
