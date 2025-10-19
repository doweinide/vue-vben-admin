import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
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

// 装饰器工厂 - 用于 Body 验证
export const ZodBody = (schema: z.ZodSchema) => {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    // 存储 schema 元数据，用于 OpenAPI 文档生成
    Reflect.defineMetadata('zod:body-schema', schema, target, propertyKey);
  };
};

// 装饰器工厂 - 用于 Query 验证
export const ZodQuery = (schema: z.ZodSchema) => {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    // 存储 schema 元数据，用于 OpenAPI 文档生成
    Reflect.defineMetadata('zod:query-schema', schema, target, propertyKey);
  };
};

// 装饰器工厂 - 用于 Param 验证
export const ZodParam = (schema: z.ZodSchema) => {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    // 存储 schema 元数据，用于 OpenAPI 文档生成
    Reflect.defineMetadata('zod:param-schema', schema, target, propertyKey);
  };
};

// 方法装饰器 - 用于验证请求体
export function ValidateBody(schema: z.ZodSchema) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // 存储 schema 元数据用于文档生成
    Reflect.defineMetadata('zod:body-schema', schema, target, propertyKey);
  };
}

// 方法装饰器 - 用于验证查询参数
export function ValidateQuery(schema: z.ZodSchema) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // 存储 schema 元数据用于文档生成
    Reflect.defineMetadata('zod:query-schema', schema, target, propertyKey);
  };
}

// 方法装饰器 - 用于验证路径参数
export function ValidateParam(schema: z.ZodSchema) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // 存储 schema 元数据用于文档生成
    Reflect.defineMetadata('zod:param-schema', schema, target, propertyKey);
  };
}
