import process from 'node:process';

import { registerAs } from '@nestjs/config';

/**
 * 数据库配置
 *
 * 定义数据库连接相关的配置参数
 * 使用 Prisma 作为 ORM，支持 SQLite 数据库
 *
 * @returns 数据库配置对象
 */
export default registerAs('database', () => ({
  /**
   * 数据库连接 URL
   *
   * SQLite 数据库文件路径配置
   * 格式: file:./path/to/database.db
   *
   * 默认值: 'file:./dev.db' (开发环境数据库文件)
   * 环境变量: DATABASE_URL
   *
   * 示例:
   * - 开发环境: file:./dev.db
   * - 测试环境: file:./test.db
   * - 生产环境: file:./prod.db 或其他持久化路径
   */
  url: process.env.DATABASE_URL || 'file:./dev.db',
}));
