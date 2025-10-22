import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// 基础响应 Schema
export const BaseResponseSchema = z.object({
  code: z.number().describe('响应状态码'),
  message: z.string().describe('响应消息'),
  data: z.any().optional().describe('响应数据'),
});

// 分页查询 Schema
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1).describe('页码'),
  limit: z.coerce.number().min(1).max(100).default(10).describe('每页数量'),
});

// 分页响应 Schema 工厂函数
export const PaginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  BaseResponseSchema.extend({
    data: z.object({
      items: z.array(dataSchema),
      total: z.number().describe('总数量'),
      page: z.number().describe('当前页码'),
      limit: z.number().describe('每页数量'),
      totalPages: z.number().describe('总页数'),
    }),
  });

// 通用 ID Schema (用于请求体)
export const IdSchema = z.object({
  id: z.coerce.number().positive().describe('ID'),
});

// 路径参数 ID Schema (用于路径参数验证)
export const IdParamSchema = z.object({
  id: z
    .string()
    .transform((val) => {
      const num = Number.parseInt(val, 10);
      if (Number.isNaN(num) || num <= 0) {
        throw new Error('Invalid ID: must be a positive number');
      }
      return num;
    })
    .describe('路径参数 ID'),
});

// 时间戳 Schema
export const TimestampSchema = z.object({
  createdAt: z.date().describe('创建时间'),
  updatedAt: z.date().describe('更新时间'),
});

// 导出基础类型
export type BaseResponse<T = any> = z.infer<typeof BaseResponseSchema> & {
  data?: T;
};
export type PaginationQuery = z.infer<typeof PaginationSchema>;
export type IdParam = z.infer<typeof IdSchema>;
export type Timestamp = z.infer<typeof TimestampSchema>;

// 成功响应构建器
export const ResponseBuilder = {
  success<T>(data?: T, message = '操作成功'): BaseResponse<T> {
    return {
      code: 200,
      message,
      data,
    };
  },

  error(code: number, message: string, data?: any): BaseResponse {
    return {
      code,
      message,
      data,
    };
  },

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
