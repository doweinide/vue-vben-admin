import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma 服务
 *
 * 数据库访问服务，继承自 PrismaClient
 * 提供数据库连接管理和 ORM 操作功能
 *
 * 功能：
 * - 自动管理数据库连接的建立和断开
 * - 提供类型安全的数据库操作接口
 * - 支持事务、查询优化等高级功能
 * - 在模块初始化时自动连接数据库
 * - 在模块销毁时自动断开数据库连接
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /**
   * 模块销毁时的清理方法
   *
   * 在应用关闭时自动调用，确保数据库连接正确断开
   * 避免连接泄漏和资源浪费
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * 模块初始化方法
   *
   * 在模块启动时自动调用，建立数据库连接
   * 确保服务可用时数据库连接已就绪
   */
  async onModuleInit() {
    await this.$connect();
  }
}
