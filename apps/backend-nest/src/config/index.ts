/**
 * 配置模块导出文件
 *
 * 统一导出所有配置模块，便于在应用中统一引入和使用
 * 每个配置模块都使用 registerAs 注册为命名配置
 */

// 应用程序基础配置
export { default as appConfig } from './app.config';

// 数据库连接配置
export { default as databaseConfig } from './database.config';
