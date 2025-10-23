import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

/**
 * 角色模块
 *
 * 提供角色管理功能，包括：
 * - 角色的 CRUD 操作
 * - 角色权限管理
 * - 批量权限分配
 */
@Module({
  imports: [PrismaModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
