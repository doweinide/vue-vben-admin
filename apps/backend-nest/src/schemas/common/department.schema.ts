import { z } from 'zod';

import {
  createPaginatedResponseSchema,
  createResponseSchema,
  createSchema,
} from '../base/base.schema';

/**
 * 部门创建数据验证模式
 * 基于 Department 数据库模型定义
 */
export const CreateDepartmentSchema = createSchema(
  z.object({
    // / 部门名称
    name: z
      .string()
      .min(1, '部门名称不能为空')
      .max(100, '部门名称不能超过100个字符')
      .describe('部门名称'),
    // / 父级部门ID，支持树形结构
    pid: z.string().optional().nullable().describe('父级部门ID，支持树形结构'),
    // / 部门状态：0-禁用，1-启用
    status: z
      .number()
      .int()
      .min(0, '状态值必须为0或1')
      .max(1, '状态值必须为0或1')
      .default(1)
      .describe('部门状态：0-禁用，1-启用'),
    // / 备注信息
    remark: z.string().optional().nullable().describe('备注信息'),
  }),
  'CreateDepartment',
  '创建部门请求',
);

/**
 * 部门更新数据验证模式
 */
export const UpdateDepartmentSchema = createSchema(
  z.object({
    // / 部门名称
    name: z
      .string()
      .min(1, '部门名称不能为空')
      .max(100, '部门名称不能超过100个字符')
      .optional()
      .describe('部门名称'),
    // / 父级部门ID，支持树形结构
    pid: z.string().optional().nullable().describe('父级部门ID，支持树形结构'),
    // / 部门状态：0-禁用，1-启用
    status: z
      .number()
      .int()
      .min(0, '状态值必须为0或1')
      .max(1, '状态值必须为0或1')
      .optional()
      .describe('部门状态：0-禁用，1-启用'),
    // / 备注信息
    remark: z.string().optional().nullable().describe('备注信息'),
  }),
  'UpdateDepartment',
  '更新部门请求',
);

/**
 * 部门查询参数验证模式
 */
export const DepartmentQuerySchema = createSchema(
  z.object({
    // / 页码，从1开始
    page: z.coerce.number().min(1).default(1).describe('页码，从1开始'),
    limit: z.coerce
      .number()
      .min(1)
      .max(100)
      .default(10)
      .describe('每页数量，最大100条'),
    // / 按部门名称筛选
    name: z.string().optional().describe('按部门名称筛选'),
    status: z
      .number()
      .int()
      .min(0)
      .max(1)
      .optional()
      .describe('按部门状态筛选：0-禁用，1-启用'),
    pid: z.string().optional().nullable().describe('按父级部门ID筛选'),
  }),
  'DepartmentQuery',
  '部门查询参数',
);

/**
 * 部门响应数据验证模式
 * 基于 Department 数据库模型定义
 */
export const DepartmentResponseSchema = createResponseSchema(
  z.object({
    // / 部门唯一标识
    id: z.string().describe('部门唯一标识'),
    // / 部门名称
    name: z.string().max(100).describe('部门名称'),
    // / 父级部门ID，支持树形结构
    pid: z.string().optional().nullable().describe('父级部门ID，支持树形结构'),
    // / 部门状态：0-禁用，1-启用
    status: z.number().int().min(0).max(1).describe('部门状态：0-禁用，1-启用'),
    // / 备注信息
    remark: z.string().optional().nullable().describe('备注信息'),
    // / 创建时间
    createTime: z.date().describe('创建时间'),
    // / 更新时间
    updateTime: z.date().describe('更新时间'),

    // / 父级部门ID
    parentId: z.string().optional().nullable().describe('父级部门ID'),
    // / 子级部门ID列表
    childrenIds: z.array(z.string()).optional().describe('子级部门ID列表'),
    // / 部门下的用户
    users: z
      .array(
        z.object({
          // / 用户唯一标识符，使用 CUID 作为主键
          id: z.string().describe('用户唯一标识符，使用 CUID 作为主键'),
          // / 用户名，必须唯一，用于登录认证
          username: z
            .string()
            .max(50)
            .describe('用户名，必须唯一，用于登录认证'),
          // / 用户邮箱地址，必须唯一，可用于找回密码等功能
          email: z
            .email()
            .max(100)
            .describe('用户邮箱地址，必须唯一，可用于找回密码等功能'),
          // / 用户真实姓名
          name: z
            .string()
            .max(50)
            .optional()
            .nullable()
            .describe('用户真实姓名'),
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
          // / 用户创建时间，自动设置为当前时间
          createdAt: z.date().describe('用户创建时间，自动设置为当前时间'),
          // / 用户信息最后更新时间，每次更新时自动更新
          updatedAt: z
            .date()
            .describe('用户信息最后更新时间，每次更新时自动更新'),
        }),
      )
      .optional()
      .describe('部门下的用户'),
  }),
  'DepartmentResponse',
  '部门响应数据',
);

/**
 * 部门响应 Schema
 */
export const DepartmentResponseWrapperSchema = createResponseSchema(
  DepartmentResponseSchema,
  'DepartmentResponse',
  '部门信息响应',
);

/**
 * 创建部门响应 Schema
 */
export const CreateDepartmentResponseSchema = createResponseSchema(
  DepartmentResponseSchema,
  'CreateDepartmentResponse',
  '创建部门响应',
);

/**
 * 更新部门响应 Schema
 */
export const UpdateDepartmentResponseSchema = createResponseSchema(
  DepartmentResponseSchema,
  'UpdateDepartmentResponse',
  '更新部门响应',
);

/**
 * 删除部门响应 Schema
 */
export const DeleteDepartmentResponseSchema = createResponseSchema(
  z.object({
    // / 删除成功消息
    message: z.string().describe('删除成功消息'),
  }),
  'DeleteDepartmentResponse',
  '删除部门响应',
);

/**
 * 分页部门响应 Schema
 * 使用统一的分页响应格式，继承自 base.schema.ts 中的 PaginatedResponseSchema
 */
export const PaginatedDepartmentsResponseSchema = createPaginatedResponseSchema(
  DepartmentResponseSchema,
  'PaginatedDepartmentsResponse',
  '分页部门列表响应',
);
