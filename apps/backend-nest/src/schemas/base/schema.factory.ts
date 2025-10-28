import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

/**
 * 通用 schema 工厂
 * 让任何 schema 拥有 `.Type` 和 `.toType()` 语法糖
 *
 * @param schema - Zod schema 对象
 * @param name - OpenAPI 名称（可选）
 * @param desc - 描述信息（可选）
 * @returns 增强后的 schema，包含 .Type 和 .toType() 方法
 */
export const createSchema = <T extends z.ZodTypeAny>(
  schema: T,
  name?: string,
  desc?: string,
) => {
  // 设置 OpenAPI 名称
  if (name) {
    (schema as any).openapi?.(name);
  }

  // 设置描述
  if (desc) {
    schema.describe(desc);
  }

  type SchemaType = z.infer<typeof schema>;

  // 添加 .Type 和 .toType() 属性
  Object.defineProperties(schema, {
    /** 返回类型占位，用于 typeof Schema.Type 推导 */
    Type: {
      get() {
        return null as unknown as SchemaType;
      },
      enumerable: false,
      configurable: false,
    },
    /** 兼容旧语法 toType() */
    toType: {
      value: (): SchemaType => ({}) as SchemaType,
      writable: false,
      enumerable: false,
      configurable: false,
    },
  });

  return schema as typeof schema & {
    toType(): SchemaType;
    readonly Type: SchemaType;
  };
};

/**
 * 扩展类型定义，为所有使用 createSchema 创建的 schema 添加类型支持
 */
export type SchemaWithType<T extends z.ZodTypeAny> = T & {
  toType(): z.infer<T>;
  readonly Type: z.infer<T>;
};
