import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ZodError } from 'zod';

/**
 * Zod 验证拦截器
 *
 * 该拦截器在方法执行前对请求参数进行验证：
 * 1. 从方法元数据中获取 Zod schema
 * 2. 验证 body、query、params 参数
 * 3. 验证失败时抛出 BadRequestException
 * 4. 验证成功后将验证后的数据设置回 request 对象
 *
 * 优势：
 * - 不需要 REQUEST scope，性能更好
 * - 不需要 Guard 传递元数据
 * - 不需要自定义参数装饰器
 * - 可以直接使用原生的 @Body(), @Query(), @Param()
 * - 逻辑集中，易于维护
 */
@Injectable()
export class ZodValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();

    // 从方法元数据中获取 Zod schemas
    const zodSchemas = Reflect.getMetadata('api:zodSchemas', handler);

    if (zodSchemas) {
      try {
        // 验证 body 参数
        if (zodSchemas.bodySchema) {
          const validatedBody = zodSchemas.bodySchema.parse(request.body || {});
          request.body = validatedBody;
        }

        // 验证 query 参数
        if (zodSchemas.querySchema) {
          const validatedQuery = zodSchemas.querySchema.parse(
            request.query || {},
          );
          request.query = validatedQuery;
        }

        // 验证 params 参数
        if (zodSchemas.paramsSchema) {
          const validatedParams = zodSchemas.paramsSchema.parse(
            request.params || {},
          );
          request.params = validatedParams;
        }
      } catch (error) {
        if (error instanceof ZodError) {
          throw new BadRequestException({
            code: 400,
            message: '请求参数验证失败',
            data: this.formatZodError(error),
          });
        }
        throw error;
      }
    }

    return next.handle();
  }

  /**
   * 格式化 Zod 验证错误
   * @param error Zod 验证错误
   * @returns 格式化后的错误信息
   */
  private formatZodError(error: ZodError) {
    return error.issues.map((err) => ({
      field: err.path.join('.'),
      message: this.getErrorMessage(err),
      code: err.code,
    }));
  }

  /**
   * 获取错误消息
   * @param err Zod 错误项
   * @returns 中文错误消息
   */
  private getErrorMessage(err: any): string {
    switch (err.code) {
      case 'custom': {
        return err.message || '自定义验证失败';
      }
      case 'invalid_arguments': {
        return '无效的参数';
      }
      case 'invalid_date': {
        return '无效的日期格式';
      }
      case 'invalid_enum_value': {
        return `无效的枚举值，允许的值为: ${err.options.join(', ')}`;
      }
      case 'invalid_intersection_types': {
        return '交集类型验证失败';
      }
      case 'invalid_literal': {
        return `值必须为 ${err.expected}`;
      }
      case 'invalid_return_type': {
        return '无效的返回类型';
      }
      case 'invalid_string': {
        if (err.validation === 'email') {
          return '邮箱格式不正确';
        }
        if (err.validation === 'url') {
          return 'URL格式不正确';
        }
        return '字符串格式不正确';
      }
      case 'invalid_type': {
        return `字段类型错误，期望 ${err.expected}，实际 ${err.received}`;
      }
      case 'not_finite': {
        return '值必须是有限数';
      }
      case 'not_multiple_of': {
        return `值必须是 ${err.multipleOf} 的倍数`;
      }
      case 'too_big': {
        if (err.type === 'string') {
          return `字符串长度不能超过 ${err.maximum} 个字符`;
        }
        if (err.type === 'number') {
          return `数值必须小于等于 ${err.maximum}`;
        }
        if (err.type === 'array') {
          return `数组长度不能超过 ${err.maximum} 个元素`;
        }
        return `值太大，最大值为 ${err.maximum}`;
      }
      case 'too_small': {
        if (err.type === 'string') {
          return `字符串长度不能少于 ${err.minimum} 个字符`;
        }
        if (err.type === 'number') {
          return `数值必须大于等于 ${err.minimum}`;
        }
        if (err.type === 'array') {
          return `数组长度不能少于 ${err.minimum} 个元素`;
        }
        return `值太小，最小值为 ${err.minimum}`;
      }
      case 'unrecognized_keys': {
        return `包含未识别的字段: ${err.keys.join(', ')}`;
      }
      default: {
        return err.message || '验证失败';
      }
    }
  }
}
