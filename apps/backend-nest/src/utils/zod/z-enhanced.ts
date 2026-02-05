import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import * as zRaw from 'zod';

extendZodWithOpenApi(zRaw);
// 工具函数
const emptyToUndefined = <T extends zRaw.ZodTypeAny>(schema: T) =>
  zRaw.preprocess((v) => (v === '' ? undefined : v), schema);

// 增强版 zPro
export const zPro = Object.assign({}, zRaw, {
  string: (...args: Parameters<typeof zRaw.string>) => zRaw.string(...args), // .refine((v) => v.trim() !== '', { message: '不能为空' }),

  number: (...args: Parameters<typeof zRaw.number>) =>
    zRaw.coerce.number(...args),

  boolean: (...args: Parameters<typeof zRaw.boolean>) =>
    zRaw.coerce.boolean(...args),

  date: (...args: Parameters<typeof zRaw.date>) => zRaw.coerce.date(...args),

  emptyToUndefined,
});

// 合并命名空间导出类型
export declare namespace zPro {
  export type ZodTypeAny = zRaw.ZodTypeAny;
  export type ZodString = zRaw.ZodString;
  export type ZodNumber = zRaw.ZodNumber;
  export type ZodBoolean = zRaw.ZodBoolean;
  export type ZodDate = zRaw.ZodDate;
  export type infer<T extends zRaw.ZodSchema> = zRaw.infer<T>;
  export type ZodType = zRaw.ZodType;
  export type ZodSchema = zRaw.ZodSchema;
}

export { zRaw };
