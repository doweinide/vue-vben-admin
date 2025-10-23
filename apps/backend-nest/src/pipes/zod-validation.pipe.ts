import {
  ArgumentMetadata,
  BadRequestException,
  Body,
  Param,
  PipeTransform,
  Query,
} from '@nestjs/common';
import { z } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      // 对于路径参数，需要特殊处理
      if (metadata.type === 'param') {
        // 如果是路径参数，将单个值包装成对象进行验证
        const paramName = metadata.data as string; // 参数名，如 'id'

        // 调试：打印路径参数的实际值和类型
        console.log(`[ZodValidationPipe] Param ${paramName}:`, {
          value,
          type: typeof value,
          isString: typeof value === 'string',
          isUndefined: value === undefined,
          isNull: value === null,
        });

        const paramObject = { [paramName]: value };
        const parsedValue = this.schema.parse(paramObject) as any;
        // 返回解析后的单个值
        return parsedValue[paramName];
      }

      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        throw new BadRequestException({
          code: 400,
          message: '请求参数验证失败',
          data: {
            errors: errorMessages,
          },
        });
      }
      throw new BadRequestException('验证失败');
    }
  }
}

export const ZodBody = (schema: z.ZodSchema) =>
  Body(new ZodValidationPipe(schema));

export const ZodQuery = (schema: z.ZodSchema) =>
  Query(new ZodValidationPipe(schema));

export const ZodParam = (schema: z.ZodSchema) => {
  return (
    target: any,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    // 调试：打印原生参数数据
    console.log('[ZodParam] Decorator called:', {
      target: target.constructor.name,
      propertyKey,
      parameterIndex,
      schema: schema._def,
    });

    return Param(new ZodValidationPipe(schema))(
      target,
      propertyKey,
      parameterIndex,
    );
  };
};
