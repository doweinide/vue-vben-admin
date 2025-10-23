import { z } from 'zod';

import {
  BaseResponseSchema,
  PaginatedResponseSchema,
  PaginationSchema,
} from './base.schema';

/**
 * 角色创建数据验证模式
 * 基于 Role 数据库模型定义
 */
export const CreateRoleSchema = z.object({
  // / 角色名称（唯一）
  name: z
    .string()
    .min(1, '角色名称不能为空')
    .max(100, '角色名称不能超过100个字符')
    .describe('角色名称（唯一）'),
  // / 角色状态：0-禁用，1-启用
  status: z
    .number()
    .int()
    .min(0, '状态值必须为0或1')
    .max(1, '状态值必须为0或1')
    .default(1)
    .describe('角色状态：0-禁用，1-启用'),
  // / 备注信息
  remark: z.string().optional().nullable().describe('备注信息'),
  // / 菜单权限ID列表
  menuIds: z
    .array(z.string())
    .optional()
    .default([])
    .describe('菜单权限ID列表'),
});

/**
 * 角色更新数据验证模式
 */
export const UpdateRoleSchema = z.object({
  // / 角色名称（唯一）
  name: z
    .string()
    .min(1, '角色名称不能为空')
    .max(100, '角色名称不能超过100个字符')
    .optional()
    .describe('角色名称（唯一）'),
  // / 角色状态：0-禁用，1-启用
  status: z
    .number()
    .int()
    .min(0, '状态值必须为0或1')
    .max(1, '状态值必须为0或1')
    .optional()
    .describe('角色状态：0-禁用，1-启用'),
  // / 备注信息
  remark: z.string().optional().nullable().describe('备注信息'),
  // / 菜单权限ID列表
  menuIds: z.array(z.string()).optional().describe('菜单权限ID列表'),
});

/**
 * 角色查询参数验证模式
 */
export const RoleQuerySchema = PaginationSchema.extend({
  // / 按角色名称筛选
  name: z.string().optional().describe('按角色名称筛选'),
  // / 按角色状态筛选：0-禁用，1-启用
  status: z
    .number()
    .int()
    .min(0)
    .max(1)
    .optional()
    .describe('按角色状态筛选：0-禁用，1-启用'),
});

/**
 * 角色权限分配验证模式
 */
export const RolePermissionSchema = z.object({
  // / 角色唯一标识
  roleId: z.string().min(1, '角色ID不能为空').describe('角色唯一标识'),
  // / 菜单权限ID列表
  menuIds: z
    .array(z.string())
    .min(0, '菜单ID数组不能为空')
    .describe('菜单权限ID列表'),
});

/**
 * 角色名称检查验证模式
 */
export const RoleNameCheckSchema = z.object({
  // / 角色名称（唯一）
  name: z.string().min(1, '角色名称不能为空').describe('角色名称（唯一）'),
});

/**
 * 角色响应数据类型
 * 基于 Role 数据库模型定义
 */
export const RoleResponseSchema = z.object({
  // / 角色唯一标识
  id: z.string().describe('角色唯一标识'),
  // / 角色名称（唯一）
  name: z.string().max(100).describe('角色名称（唯一）'),
  // / 角色状态：0-禁用，1-启用
  status: z.number().int().min(0).max(1).describe('角色状态：0-禁用，1-启用'),
  // / 备注信息
  remark: z.string().optional().nullable().describe('备注信息'),
  // / 创建时间
  createTime: z.date().describe('创建时间'),
  // / 更新时间
  updateTime: z.date().describe('更新时间'),

  // 关联数据
  // / 角色下的用户（多对多关联）
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
        // / 关联的用户信息
        user: z
          .object({
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
            // / 用户账户状态：0-禁用，1-启用
            status: z
              .number()
              .int()
              .min(0)
              .max(1)
              .describe('用户账户状态：0-禁用，1-启用'),
          })
          .optional()
          .describe('关联的用户信息'),
      }),
    )
    .optional()
    .describe('角色下的用户（多对多关联）'),

  // / 角色权限关联
  rolePermissions: z
    .array(
      z.object({
        // / 关联记录唯一标识
        id: z.string().describe('关联记录唯一标识'),
        // / 角色ID
        roleId: z.string().describe('角色ID'),
        // / 菜单ID
        menuId: z.string().describe('菜单ID'),
        // / 创建时间
        createTime: z.date().describe('创建时间'),
        // / 关联的菜单信息
        menu: z
          .object({
            // / 菜单唯一标识
            id: z.string().describe('菜单唯一标识'),
            // / 菜单名称（唯一）
            name: z.string().max(100).describe('菜单名称（唯一）'),
            // / 路由路径（唯一，可为空）
            path: z
              .string()
              .max(200)
              .optional()
              .nullable()
              .describe('路由路径（唯一，可为空）'),
            // / 组件路径
            component: z
              .string()
              .max(200)
              .optional()
              .nullable()
              .describe('组件路径'),
            // / 菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链
            type: z
              .string()
              .max(20)
              .describe(
                '菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链',
              ),
            // / 权限标识码
            authCode: z
              .string()
              .max(100)
              .optional()
              .nullable()
              .describe('权限标识码'),
            // / 菜单状态：0-禁用，1-启用
            status: z
              .number()
              .int()
              .min(0)
              .max(1)
              .describe('菜单状态：0-禁用，1-启用'),
            // / 创建时间
            createTime: z.date().describe('创建时间'),
            // / 更新时间
            updateTime: z.date().describe('更新时间'),
          })
          .optional()
          .describe('关联的菜单信息'),
      }),
    )
    .optional()
    .describe('角色权限关联'),
});

/**
 * 角色响应 Schema
 */
export const RoleResponseWrapperSchema = BaseResponseSchema.extend({
  data: RoleResponseSchema,
});

/**
 * 创建角色响应 Schema
 */
export const CreateRoleResponseSchema = BaseResponseSchema.extend({
  data: RoleResponseSchema,
});

/**
 * 更新角色响应 Schema
 */
export const UpdateRoleResponseSchema = BaseResponseSchema.extend({
  data: RoleResponseSchema,
});

/**
 * 删除角色响应 Schema
 */
export const DeleteRoleResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    // / 删除成功消息
    message: z.string().describe('删除成功消息'),
  }),
});

/**
 * 分页角色响应 Schema
 * 使用统一的分页响应格式，继承自 base.schema.ts 中的 PaginatedResponseSchema
 */
export const PaginatedRolesResponseSchema =
  PaginatedResponseSchema(RoleResponseSchema);

// 导出类型
export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;
export type RoleQueryDto = z.infer<typeof RoleQuerySchema>;
export type RolePermissionDto = z.infer<typeof RolePermissionSchema>;
export type RoleNameCheckDto = z.infer<typeof RoleNameCheckSchema>;
export type RoleResponseDto = z.infer<typeof RoleResponseSchema>;
export type RoleResponse = z.infer<typeof RoleResponseWrapperSchema>;
export type CreateRoleResponse = z.infer<typeof CreateRoleResponseSchema>;
export type UpdateRoleResponse = z.infer<typeof UpdateRoleResponseSchema>;
export type DeleteRoleResponse = z.infer<typeof DeleteRoleResponseSchema>;
export type PaginatedRolesResponse = z.infer<
  typeof PaginatedRolesResponseSchema
>;
