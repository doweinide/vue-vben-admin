import { zPro as z } from '@/utils/zod/z-enhanced';

import {
  createPaginatedResponseSchema,
  createResponseSchema,
  createSchema,
} from '../base/base.schema';

/**
 * 菜单元数据验证模式
 * 菜单元数据（JSON格式存储图标、标题等信息）
 */
export const MenuMetaSchema = createSchema(
  z.object({
    // / 菜单标题
    title: z.string().optional().describe('菜单标题'),
    // / 菜单图标
    icon: z.string().optional().describe('菜单图标'),
    // / 是否在菜单中隐藏
    hideInMenu: z.boolean().optional().describe('是否在菜单中隐藏'),
    // / 是否在面包屑中隐藏
    hideInBreadcrumb: z.boolean().optional().describe('是否在面包屑中隐藏'),
    // / 是否隐藏子菜单
    hideChildrenInMenu: z.boolean().optional().describe('是否隐藏子菜单'),
    // / 排序号
    orderNo: z.number().optional().describe('排序号'),
    // / 内嵌框架地址
    frameSrc: z.string().optional().describe('内嵌框架地址'),
    // / 外部链接地址
    externalLink: z.string().optional().describe('外部链接地址'),
    // / 是否忽略缓存
    ignoreKeepAlive: z.boolean().optional().describe('是否忽略缓存'),
    // / 是否固定标签页
    affix: z.boolean().optional().describe('是否固定标签页'),
    // / 是否携带参数
    carryParam: z.boolean().optional().describe('是否携带参数'),
    // / 是否单独显示
    single: z.boolean().optional().describe('是否单独显示'),
    // / 当前激活菜单
    currentActiveMenu: z.string().optional().describe('当前激活菜单'),
    // / 是否隐藏标签页
    hideTab: z.boolean().optional().describe('是否隐藏标签页'),
    // / 是否隐藏菜单
    hideMenu: z.boolean().optional().describe('是否隐藏菜单'),
    // / 是否为外链
    isLink: z.boolean().optional().describe('是否为外链'),
    // / 是否忽略路由
    ignoreRoute: z.boolean().optional().describe('是否忽略路由'),
    // / 是否为子级隐藏路径
    hidePathForChildren: z.boolean().optional().describe('是否为子级隐藏路径'),
  }),
  'MenuMeta',
  '菜单元数据',
);

/**
 * 菜单创建数据验证模式
 * 基于 Menu 数据库模型定义
 */
export const CreateMenuSchema = createSchema(
  z.object({
    // / 菜单名称（唯一）
    name: z
      .string()
      .min(1, '菜单名称不能为空')
      .max(100, '菜单名称不能超过100个字符')
      .describe('菜单名称（唯一）'),
    // / 路由路径（唯一，可为空）
    path: z
      .string()
      .max(200, '路由路径不能超过200个字符')
      .optional()
      .nullable()
      .describe('路由路径（唯一，可为空）'),
    // / 组件路径
    component: z
      .string()
      .max(200, '组件路径不能超过200个字符')
      .optional()
      .nullable()
      .describe('组件路径'),
    // / 菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链
    type: z
      .enum(['catalog', 'menu', 'button', 'embedded', 'link'], {
        message: '菜单类型必须是 catalog、menu、button、embedded 或 link 之一',
      })
      .describe(
        '菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链',
      ),
    // / 权限标识码
    authCode: z
      .string()
      .max(100, '权限标识不能超过100个字符')
      .optional()
      .nullable()
      .describe('权限标识码'),
    // / 父级菜单ID，支持树形结构
    pid: z.string().optional().nullable().describe('父级菜单ID，支持树形结构'),
    // / 菜单状态：0-禁用，1-启用
    status: z
      .number()
      .int()
      .min(0, '状态值必须为0或1')
      .max(1, '状态值必须为0或1')
      .default(1)
      .describe('菜单状态：0-禁用，1-启用'),
    // / 菜单元数据（JSON格式存储图标、标题等信息）
    meta: MenuMetaSchema.optional()
      .nullable()
      .describe('菜单元数据（JSON格式存储图标、标题等信息）'),
  }),
  'CreateMenu',
  '创建菜单请求',
);

/**
 * 菜单更新数据验证模式
 */
export const UpdateMenuSchema = createSchema(
  z.object({
    // / 菜单名称（唯一）
    name: z
      .string()
      .min(1, '菜单名称不能为空')
      .max(100, '菜单名称不能超过100个字符')
      .optional()
      .describe('菜单名称（唯一）'),
    // / 路由路径（唯一，可为空）
    path: z
      .string()
      .max(200, '路由路径不能超过200个字符')
      .optional()
      .nullable()
      .describe('路由路径（唯一，可为空）'),
    // / 组件路径
    component: z
      .string()
      .max(200, '组件路径不能超过200个字符')
      .optional()
      .nullable()
      .describe('组件路径'),
    // / 菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链
    type: z
      .enum(['catalog', 'menu', 'button', 'embedded', 'link'])
      .optional()
      .describe(
        '菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链',
      ),
    // / 权限标识码
    authCode: z
      .string()
      .max(100, '权限标识不能超过100个字符')
      .optional()
      .nullable()
      .describe('权限标识码'),
    // / 父级菜单ID，支持树形结构
    pid: z.string().optional().nullable().describe('父级菜单ID，支持树形结构'),
    // / 菜单状态：0-禁用，1-启用
    status: z
      .number()
      .int()
      .min(0, '状态值必须为0或1')
      .max(1, '状态值必须为0或1')
      .optional()
      .describe('菜单状态：0-禁用，1-启用'),
    // / 菜单元数据（JSON格式存储图标、标题等信息）
    meta: MenuMetaSchema.optional()
      .nullable()
      .describe('菜单元数据（JSON格式存储图标、标题等信息）'),
  }),
  'UpdateMenu',
  '更新菜单请求',
);

/**
 * 菜单查询参数验证模式
 */
export const MenuQuerySchema = createSchema(
  z.object({
    // 分页参数
    page: z.number().min(1).default(1).describe('页码，从1开始'),
    limit: z
      .number()
      .min(1)
      .max(100)
      .default(10)
      .describe('每页数量，最大100条'),
    // 筛选参数
    name: z.string().optional().describe('按菜单名称筛选'),
    type: z
      .enum(['catalog', 'menu', 'button', 'embedded', 'link'])
      .optional()
      .describe('按菜单类型筛选'),
    status: z
      .number()
      .int()
      .min(0)
      .max(1)
      .optional()
      .describe('按菜单状态筛选：0-禁用，1-启用'),
    pid: z.string().optional().nullable().describe('按父级菜单ID筛选'),
  }),
  'MenuQuery',
  '菜单查询参数',
);

/**
 * 菜单名称存在性检查验证模式
 */
export const MenuNameExistsSchema = createSchema(
  z.object({
    // / 菜单名称（唯一）
    name: z.string().min(1, '菜单名称不能为空').describe('菜单名称（唯一）'),
    // / 菜单ID，用于排除自身
    id: z.string().optional().describe('菜单ID，用于排除自身'),
  }),
  'MenuNameExists',
  '菜单名称存在性检查',
);

/**
 * 菜单路径存在性检查验证模式
 */
export const MenuPathExistsSchema = createSchema(
  z.object({
    // / 路由路径（唯一，可为空）
    path: z
      .string()
      .min(1, '路由路径不能为空')
      .describe('路由路径（唯一，可为空）'),
    // / 菜单ID，用于排除自身
    id: z.string().optional().describe('菜单ID，用于排除自身'),
  }),
  'MenuPathExists',
  '菜单路径存在性检查',
);

/**
 * 菜单响应数据类型
 * 基于 Menu 数据库模型定义
 */
export const MenuResponseSchema = createSchema(
  z.object({
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
    component: z.string().max(200).optional().nullable().describe('组件路径'),
    // / 菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链
    type: z
      .string()
      .max(20)
      .describe(
        '菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链',
      ),
    // / 权限标识码
    authCode: z.string().max(100).optional().nullable().describe('权限标识码'),
    // / 父级菜单ID，支持树形结构
    pid: z.string().optional().nullable().describe('父级菜单ID，支持树形结构'),
    // / 菜单状态：0-禁用，1-启用
    status: z.number().int().min(0).max(1).describe('菜单状态：0-禁用，1-启用'),
    // / 菜单元数据（JSON格式存储图标、标题等信息）
    meta: z
      .any()
      .optional()
      .nullable()
      .describe('菜单元数据（JSON格式存储图标、标题等信息）'),
    // / 创建时间
    createTime: z.date().describe('创建时间'),
    // / 更新时间
    updateTime: z.date().describe('更新时间'),

    // 关联数据
    // / 父级菜单ID（避免循环引用）
    parentId: z.string().optional().nullable().describe('父级菜单ID'),
    // / 子级菜单ID列表（避免循环引用）
    childrenIds: z.array(z.string()).optional().describe('子级菜单ID列表'),
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
      .describe('角色权限关联'),
  }),
  'MenuResponse',
  '菜单响应数据',
);

/**
 * 菜单响应 Schema
 */
export const MenuResponseWrapperSchema = createResponseSchema(
  MenuResponseSchema,
  'MenuResponse',
  '菜单信息响应',
);

/**
 * 创建菜单响应 Schema
 */
export const CreateMenuResponseSchema = createResponseSchema(
  MenuResponseSchema,
  'CreateMenuResponse',
  '创建菜单响应',
);

/**
 * 更新菜单响应 Schema
 */
export const UpdateMenuResponseSchema = createResponseSchema(
  MenuResponseSchema,
  'UpdateMenuResponse',
  '更新菜单响应',
);

/**
 * 删除菜单响应 Schema
 */
export const DeleteMenuResponseSchema = createResponseSchema(
  z.object({
    // / 删除成功消息
    message: z.string().describe('删除成功消息'),
  }),
  'DeleteMenuResponse',
  '删除菜单响应',
);

/**
 * 分页菜单响应 Schema
 */
export const PaginatedMenusResponseSchema = createPaginatedResponseSchema(
  MenuResponseSchema,
  'PaginatedMenusResponse',
  '分页菜单列表响应',
);
