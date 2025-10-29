import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { ZodError } from 'zod';

/**
 * 自定义 Query 参数装饰器，支持 Zod 验证和类型转换
 *
 * 该装饰器会：
 * 1. 从方法元数据中获取 querySchema
 * 2. 对 query 参数进行 Zod 验证和类型转换
 * 3. 返回验证后的数据
 */
export const ZodQuery = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const handler = ctx.getHandler();

    // 从方法元数据中获取 Zod schemas
    const zodSchemas = Reflect.getMetadata('api:zodSchemas', handler);

    if (!zodSchemas?.querySchema) {
      // 如果没有 querySchema，返回原始 query 数据
      return data ? request.query[data] : request.query;
    }

    try {
      // 使用 Zod schema 验证和转换 query 参数
      const validatedQuery = zodSchemas.querySchema.parse(request.query || {});

      // 如果指定了特定字段名，返回该字段的值
      if (data) {
        return validatedQuery[data];
      }

      // 否则返回整个验证后的 query 对象
      return validatedQuery;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          code: 400,
          message: 'Query 参数验证失败',
          data: formatZodError(error),
        });
      }
      throw error;
    }
  },
);

/**
 * 自定义 Body 参数装饰器，支持 Zod 验证和类型转换
 *
 * 该装饰器会：
 * 1. 从方法元数据中获取 bodySchema
 * 2. 对 body 参数进行 Zod 验证和类型转换
 * 3. 返回验证后的数据
 */
export const ZodBody = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const handler = ctx.getHandler();

    // 从方法元数据中获取 Zod schemas
    const zodSchemas = Reflect.getMetadata('api:zodSchemas', handler);

    if (!zodSchemas?.bodySchema) {
      // 如果没有 bodySchema，返回原始 body 数据
      return data ? request.body[data] : request.body;
    }

    try {
      // 使用 Zod schema 验证和转换 body 参数
      const validatedBody = zodSchemas.bodySchema.parse(request.body || {});

      // 如果指定了特定字段名，返回该字段的值
      if (data) {
        return validatedBody[data];
      }

      // 否则返回整个验证后的 body 对象
      return validatedBody;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          code: 400,
          message: 'Body 参数验证失败',
          data: formatZodError(error),
        });
      }
      throw error;
    }
  },
);

/**
 * 自定义 Param 参数装饰器，支持 Zod 验证和类型转换
 *
 * 该装饰器会：
 * 1. 从方法元数据中获取 paramSchema
 * 2. 对 params 参数进行 Zod 验证和类型转换
 * 3. 返回验证后的数据
 */
export const ZodParam = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const handler = ctx.getHandler();

    // 从方法元数据中获取 Zod schemas
    const zodSchemas = Reflect.getMetadata('api:zodSchemas', handler);

    if (!zodSchemas?.paramSchema) {
      // 如果没有 paramSchema，返回原始 params 数据
      return data ? request.params[data] : request.params;
    }

    try {
      // 使用 Zod schema 验证和转换 params 参数
      const validatedParams = zodSchemas.paramSchema.parse(
        request.params || {},
      );

      // 如果指定了特定字段名，返回该字段的值
      if (data) {
        return validatedParams[data];
      }

      // 否则返回整个验证后的 params 对象
      return validatedParams;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          code: 400,
          message: 'Params 参数验证失败',
          data: formatZodError(error),
        });
      }
      throw error;
    }
  },
);

/**
 * 格式化 Zod 验证错误
 * @param error Zod 验证错误
 * @returns 格式化后的错误信息
 */
function formatZodError(error: ZodError) {
  return error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}
