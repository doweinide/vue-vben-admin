import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

/**
 * Prisma 模块
 *
 * 全局数据库访问模块，提供 Prisma 服务
 * 使用 @Global() 装饰器，使得 PrismaService 在整个应用中可用
 * 无需在每个模块中重复导入
 *
 * 功能：
 * - 提供全局的数据库访问服务
 * - 管理数据库连接生命周期
 * - 为其他模块提供统一的数据访问接口
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
