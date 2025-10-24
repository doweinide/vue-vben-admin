import {
  ArgumentMetadata,
  BadRequestException,
  Inject,
  Injectable,
  PipeTransform,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { z } from 'zod';

@Injectable({ scope: Scope.REQUEST })
export class ZodValidationPipe implements PipeTransform {
  constructor(@Inject(REQUEST) private readonly request: any) {}

  transform(value: any, metadata: ArgumentMetadata) {
    // 添加调试日志
    console.log('[ZodValidationPipe] Transform called:', {
      type: metadata.type,
      data: metadata.data,
      metatype: metadata.metatype?.name,
      value: JSON.stringify(value),
      hasRequest: !!this.request,
    });

    // 尝试从 request 对象获取 handler
    const handler =
      this.request?.route?.stack?.[0]?.handle || this.request?.handler;

    if (!handler) {
      console.log(
        '[ZodValidationPipe] No handler found, returning original value',
      );
      return value;
    }

    // 从方法上获取 schema 元数据
    const schemas = Reflect.getMetadata('api:zodSchemas', handler);

    if (!schemas) {
      console.log(
        '[ZodValidationPipe] No schemas found, returning original value',
      );
      return value;
    }

    let schema: undefined | z.ZodSchema;

    // 根据参数类型选择对应的 schema
    switch (metadata.type) {
      case 'body': {
        schema = schemas.bodySchema;
        break;
      }
      case 'param': {
        schema = schemas.paramSchema;
        break;
      }
      case 'query': {
        schema = schemas.querySchema;
        break;
      }
      default: {
        return value;
      }
    }

    console.log(
      '[ZodValidationPipe] Selected schema:',
      schema ? 'found' : 'not found',
    );

    if (!schema) {
      return value;
    }

    try {
      // 对于路径参数，需要特殊处理
      if (metadata.type === 'param') {
        // 如果是路径参数，将单个值包装成对象进行验证
        const paramName = metadata.data as string;
        const paramObject = { [paramName]: value };
        console.log(
          '[ZodValidationPipe] Validating param object:',
          paramObject,
        );
        const parsedValue = schema.parse(paramObject) as any;
        return parsedValue[paramName];
      }

      console.log('[ZodValidationPipe] Validating value:', value);
      const parsedValue = schema.parse(value);
      console.log('[ZodValidationPipe] Validation successful');
      return parsedValue;
    } catch (error) {
      console.log('[ZodValidationPipe] Validation failed:', error);
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        throw new BadRequestException({
          code: 400,
          message: '请求参数验证失败',
          data: errorMessages,
        });
      }
      throw error;
    }
  }
}
