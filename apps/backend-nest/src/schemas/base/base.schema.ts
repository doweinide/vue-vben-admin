import { zPro as z } from '@/utils/zod/z-enhanced';

import { createSchema } from './schema.factory';

// 重新导出 createSchema 函数
export { createSchema };

/**
 * ✅ 基础响应结构（所有接口通用的最外层格式）
 * 内部使用，不对外导出
 */
const BaseResponseSchema = z
  .object({
    code: z.number().describe('响应状态码，200表示成功，其他表示错误'),
    message: z.string().describe('响应消息，描述操作结果'),
    data: z.any().optional().describe('响应数据，具体内容根据接口而定'),
  })
  .openapi('BaseResponse')
  .describe('API 统一响应格式');

/**
 * ✅ 分页参数 Schema（通用查询参数）
 * 内部使用，不对外导出
 */
const PaginationSchema = z
  .object({
    page: z.coerce.number().min(1).default(1).describe('页码，从1开始'),
    limit: z.coerce
      .number()
      .min(1)
      .max(100)
      .default(10)
      .describe('每页数量，最大100条'),
  })
  .openapi('PaginationQuery')
  .describe('分页查询参数');

/**
 * ✅ 工具函数：创建统一响应 Schema
 * 自动生成 openapi 名称和描述，支持 .Type 语法糖
 */
export const createResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
  name: string,
  desc?: string,
) =>
  createSchema(
    z.object({
      code: z.number().describe('响应状态码，200表示成功，其他表示错误'),
      message: z.string().describe('响应消息，描述操作结果'),
      data: dataSchema.describe('响应数据'),
    }),
    name,
    desc ?? `${name} 响应格式`,
  );

/**
 * ✅ 工具函数：创建分页响应 Schema
 * 自动附带分页元信息，支持 .Type 语法糖
 */
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
  name?: string,
  desc?: string,
) => {
  // 尝试获取子 schema 的 openapi 名称
  const refName =
    (dataSchema as any)._def?.openapi?.ref ??
    dataSchema.description ??
    'UnknownData';

  return createResponseSchema(
    z.object({
      items: z.array(dataSchema).describe('数据列表'),
      total: z.number().describe('总记录数'),
      page: z.number().describe('当前页码'),
      limit: z.number().describe('每页数量'),
      totalPages: z.number().describe('总页数'),
    }),
    name ?? `${refName}PaginatedResponse`,
    desc ?? `${refName} 分页响应`,
  );
};

/**
 * ✅ 辅助类型：生成 TS 类型（自动推断）
 */
export type ApiResponse<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof createResponseSchema<T>>
>;

export type PaginatedApiResponse<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof createPaginatedResponseSchema<T>>
>;

/**
 * 分页响应验证模式工厂函数
 * 用于创建分页响应的通用格式
 * @deprecated 使用 createPaginatedResponseSchema 替代
 */
export const PaginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  BaseResponseSchema.extend({
    data: z
      .object({
        // / 数据列表
        items: z.array(dataSchema).describe('数据列表'),
        // / 总记录数
        total: z.number().describe('总记录数'),
        // / 当前页码
        page: z.number().describe('当前页码'),
        // / 每页数量
        limit: z.number().describe('每页数量'),
        // / 总页数
        totalPages: z.number().describe('总页数'),
      })
      .describe('分页数据'),
  });

/**
 * 通用 ID 验证模式（用于请求体）
 * 使用字符串类型匹配数据库 CUID
 */
export const IdSchema = createSchema(
  z.object({
    // / 唯一标识符，使用 CUID 格式
    id: z.string().describe('唯一标识符，使用 CUID 格式'),
  }),
  'IdParam',
  '通用 ID 参数',
);

/**
 * 路径参数 ID 验证模式（用于路径参数验证）
 * 使用字符串类型匹配数据库 CUID
 */
export const IdParamSchema = createSchema(
  z.object({
    // / 路径参数 ID，CUID 格式
    id: z.string().min(1, 'ID 不能为空').describe('路径参数 ID，CUID 格式'),
  }),
  'IdPathParam',
  '路径参数 ID 验证',
);

/**
 * 时间戳验证模式
 * 匹配数据库字段名 createTime 和 updateTime
 */
export const TimestampSchema = createSchema(
  z.object({
    // / 记录创建时间
    createTime: z.date().describe('记录创建时间'),
    // / 记录最后更新时间
    updateTime: z.date().describe('记录最后更新时间'),
  }),
  'Timestamp',
  '时间戳字段',
);

/**
 * 状态验证模式
 * 通用状态字段：0-禁用，1-启用
 */
export const StatusSchema = createSchema(
  z.object({
    // / 状态：0-禁用，1-启用
    status: z.number().int().min(0).max(1).describe('状态：0-禁用，1-启用'),
  }),
  'Status',
  '状态字段',
);

/**
 * 排序查询参数验证模式
 * 用于排序查询的通用参数
 */
export const SortSchema = createSchema(
  z.object({
    // / 排序字段
    sortBy: z.string().optional().describe('排序字段'),
    // / 排序方向：asc-升序，desc-降序
    sortOrder: z
      .enum(['asc', 'desc'])
      .default('desc')
      .describe('排序方向：asc-升序，desc-降序'),
  }),
  'SortQuery',
  '排序查询参数',
);

/**
 * 搜索查询参数验证模式
 * 用于搜索查询的通用参数
 */
export const SearchSchema = createSchema(
  z.object({
    // / 搜索关键词
    keyword: z.string().optional().describe('搜索关键词'),
  }),
  'SearchQuery',
  '搜索查询参数',
);

/**
 * 批量操作验证模式
 * 用于批量操作的通用参数
 */
export const BatchOperationSchema = createSchema(
  z.object({
    // / ID 列表
    ids: z.array(z.string()).min(1, '至少选择一个项目').describe('ID 列表'),
  }),
  'BatchOperation',
  '批量操作参数',
);

/**
 * 删除响应验证模式
 * 通用删除操作响应格式
 */
export const DeleteResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    // / 删除成功消息
    message: z.string().describe('删除成功消息'),
  }),
});

// 导出基础类型
export type BaseResponse<T = any> = z.infer<typeof BaseResponseSchema> & {
  data?: T;
};
export type PaginationQuery = z.infer<typeof PaginationSchema>;
export type IdParam = z.infer<typeof IdSchema>;
export type Timestamp = z.infer<typeof TimestampSchema>;
export type Status = z.infer<typeof StatusSchema>;
export type Sort = z.infer<typeof SortSchema>;
export type Search = z.infer<typeof SearchSchema>;
export type BatchOperation = z.infer<typeof BatchOperationSchema>;
export type DeleteResponse = z.infer<typeof DeleteResponseSchema>;

/**
 * 响应构建器
 * 用于构建标准化的 API 响应
 */
export const ResponseBuilder = {
  /**
   * 构建成功响应
   */
  success<T>(data?: T, message = '操作成功'): BaseResponse<T> {
    return {
      code: 200,
      message,
      data,
    };
  },

  /**
   * 构建错误响应
   */
  error(code: number, message: string, data?: any): BaseResponse {
    return {
      code,
      message,
      data,
    };
  },

  /**
   * 构建分页响应
   */
  paginated<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    message = '查询成功',
  ): BaseResponse<{
    items: T[];
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  }> {
    return {
      code: 200,
      message,
      data: {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
