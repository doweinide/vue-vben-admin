/**
 * Schema 统一导出文件
 * 将所有 schema 文件统一导出，方便模块引用
 */

// 基础 Schema 导出
export * from './base/base.schema';
export { createSchema } from './base/schema.factory';

// 通用 Schema 导出
export * from './common/auth.schema';
export * from './common/department.schema';
export * from './common/menu.schema';
export * from './common/role.schema';
export * from './common/user.schema';
