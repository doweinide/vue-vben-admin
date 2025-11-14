import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient as PrismaClientNode } from '@prisma/client';
import { PrismaClient as PrismaClientEdge } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

/**
 * Prisma 服务
 *
 * 数据库访问服务，使用 Prisma Edge Client 和 Accelerate 扩展
 * 提供数据库连接管理和 ORM 操作功能
 *
 * 功能：
 * - 自动管理数据库连接的建立和断开
 * - 提供类型安全的数据库操作接口
 * - 支持事务、查询优化等高级功能
 * - 使用 Prisma Accelerate 进行连接池和缓存优化
 * - 支持远端数据库连接
 * - 在模块初始化时自动连接数据库
 * - 在模块销毁时自动断开数据库连接
 */
@Injectable()
export class PrismaService implements OnModuleInit {
  public client: any;

  // 代理原始执行方法
  get $executeRaw() {
    return this.client.$executeRaw;
  }

  // 代理原始查询方法
  get $queryRaw() {
    return this.client.$queryRaw;
  }

  // 代理事务方法
  get $transaction() {
    return this.client.$transaction;
  }

  get department() {
    return this.client.department;
  }

  get menu() {
    return this.client.menu;
  }

  get role() {
    return this.client.role;
  }

  get rolePermission() {
    return this.client.rolePermission;
  }

  // 代理方法，让服务可以直接调用 Prisma 客户端的方法
  get user() {
    return this.client.user;
  }

  get userRole() {
    return this.client.userRole;
  }

  constructor() {
    this.client = this.createPrismaClient();
  }

  /**
   * 模块销毁时的清理方法
   *
   * 在应用关闭时自动调用，确保数据库连接正确断开
   * 避免连接泄漏和资源浪费
   */
  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  /**
   * 模块初始化方法
   *
   * 在模块启动时自动调用，建立数据库连接
   * 确保服务可用时数据库连接已就绪
   */
  async onModuleInit() {
    await this.client.$connect();
  }

  /**
   * 创建 Prisma 客户端实例
   *
   * 使用 Edge Client 和 Accelerate 扩展来优化性能
   * 支持连接池、查询缓存等功能
   */
  private createPrismaClient() {
    const dbMode = process.env.DB_CONNECTION || 'auto';
    const databaseUrl = process.env.DATABASE_URL || '';
    const localUrl =
      process.env.DATABASE_URL_LOCAL ||
      'postgresql://postgres:postgres@localhost:5432/vben?schema=public';

    const useRemote =
      dbMode === 'remote' ||
      (dbMode === 'auto' && databaseUrl.startsWith('prisma+'));

    console.log(
      `[Prisma] mode=${dbMode} useRemote=${useRemote} url=${
        useRemote ? databaseUrl : localUrl
      }`,
    );

    if (useRemote) {
      return new PrismaClientEdge().$extends(withAccelerate());
    }

    process.env.DATABASE_URL = localUrl;
    process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';
    return new PrismaClientNode({
      datasources: { db: { url: localUrl } },
    });
  }
}
