import { registerAs } from '@nestjs/config';

/**
 * 应用程序配置
 *
 * 定义应用程序的基本配置参数，包括端口、环境、API前缀等
 * 所有配置项都支持通过环境变量进行覆盖
 *
 * @returns 应用配置对象
 */
export default registerAs('app', () => ({
  /**
   * 应用服务端口
   * 默认值: 3333
   * 环境变量: PORT
   */
  port: Number.parseInt(process.env.PORT || '3333', 10),

  /**
   * Node.js 运行环境
   * 可选值: 'development' | 'production' | 'test'
   * 默认值: 'development'
   * 环境变量: NODE_ENV
   */
  nodeEnv: process.env.NODE_ENV || 'development',

  /**
   * API 路由前缀
   * 所有 API 路由都会添加此前缀
   * 例如: /api/users, /api/auth
   * 默认值: 'api'
   * 环境变量: API_PREFIX
   */
  apiPrefix: process.env.API_PREFIX || 'api',

  /**
   * CORS 跨域配置
   * 允许跨域请求的源地址
   * '*' 表示允许所有源地址（仅开发环境推荐）
   * 生产环境应设置具体的域名
   * 默认值: '*'
   * 环境变量: CORS_ORIGIN
   */
  corsOrigin: process.env.CORS_ORIGIN || '*',
}));
