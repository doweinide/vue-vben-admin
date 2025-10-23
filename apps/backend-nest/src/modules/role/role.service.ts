import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateRoleDto,
  RolePermissionDto,
  RoleQueryDto,
  UpdateRoleDto,
} from '../../schemas/role.schema';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 分配权限给角色
   */
  async assignPermissions(roleId: string, menuIds: string[]): Promise<void> {
    // 先删除现有权限
    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // 添加新权限
    if (menuIds.length > 0) {
      const rolePermissions = menuIds.map((menuId) => ({
        roleId,
        menuId,
      }));

      await this.prisma.rolePermission.createMany({
        data: rolePermissions,
      });
    }
  }

  /**
   * 批量分配权限
   */
  async batchAssignPermissions(
    assignments: RolePermissionDto[],
  ): Promise<void> {
    await this.prisma.$transaction(async (prisma) => {
      for (const assignment of assignments) {
        const { roleId, menuIds } = assignment;

        // 验证角色是否存在
        const role = await prisma.role.findUnique({
          where: { id: roleId },
        });
        if (!role) {
          throw new NotFoundException(`角色 ${roleId} 不存在`);
        }

        // 验证菜单是否存在
        if (menuIds.length > 0) {
          const menuCount = await prisma.menu.count({
            where: {
              id: { in: menuIds },
            },
          });
          if (menuCount !== menuIds.length) {
            throw new BadRequestException(`角色 ${roleId} 的部分菜单不存在`);
          }
        }

        // 删除现有权限
        await prisma.rolePermission.deleteMany({
          where: { roleId },
        });

        // 添加新权限
        if (menuIds.length > 0) {
          const rolePermissions = menuIds.map((menuId) => ({
            roleId,
            menuId,
          }));

          await prisma.rolePermission.createMany({
            data: rolePermissions,
          });
        }
      }
    });
  }

  /**
   * 创建角色
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, status, remark, menuIds: permissions = [] } = createRoleDto;

    // 检查角色名称是否重复
    const existingRole = await this.prisma.role.findUnique({
      where: { name },
    });
    if (existingRole) {
      throw new BadRequestException('角色名称已存在');
    }

    // 验证权限菜单是否存在
    if (permissions && permissions.length > 0) {
      const menuCount = await this.prisma.menu.count({
        where: {
          id: { in: permissions },
        },
      });
      if (menuCount !== permissions.length) {
        throw new BadRequestException('部分菜单不存在');
      }
    }

    // 创建角色
    const role = await this.prisma.role.create({
      data: {
        name,
        status: status ?? 1,
        remark,
      },
    });

    // 分配权限
    if (permissions && permissions.length > 0) {
      await this.assignPermissions(role.id, permissions);
    }

    return role;
  }

  /**
   * 获取角色列表
   */
  async findAll(query?: RoleQueryDto): Promise<any[]> {
    const where: any = {};

    if (query?.name) {
      where.name = {
        contains: query.name,
      };
    }

    if (query?.status !== undefined) {
      where.status = query.status;
    }

    const roles = await this.prisma.role.findMany({
      where,
      include: {
        rolePermissions: {
          include: {
            menu: {
              select: {
                id: true,
                name: true,
                authCode: true,
              },
            },
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
      orderBy: {
        createTime: 'desc',
      },
    });

    // 格式化返回数据，添加权限列表
    return roles.map((role) => ({
      ...role,
      permissions: role.rolePermissions.map((rp) => rp.menuId),
      userCount: role._count.userRoles,
    }));
  }

  /**
   * 根据ID获取角色详情
   */
  async findOne(id: string): Promise<any> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            menu: {
              select: {
                id: true,
                name: true,
                authCode: true,
                type: true,
                path: true,
              },
            },
          },
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return {
      ...role,
      permissions: role.rolePermissions.map((rp) => rp.menuId),
    };
  }

  /**
   * 获取角色权限
   */
  async getRolePermissions(roleId: string): Promise<string[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      select: { menuId: true },
    });

    return rolePermissions.map((rp) => rp.menuId);
  }

  /**
   * 删除角色
   */
  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    // 检查是否有用户使用该角色
    const usersCount = await this.prisma.userRole.count({
      where: { roleId: id },
    });
    if (usersCount > 0) {
      throw new BadRequestException('角色下存在用户，无法删除');
    }

    // 删除角色权限关联
    await this.prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    // 删除角色
    await this.prisma.role.delete({
      where: { id },
    });
  }

  /**
   * 更新角色
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    const { name, status, remark, menuIds: permissions } = updateRoleDto;

    // 检查角色名称是否重复
    if (name && name !== role.name) {
      const existingRole = await this.prisma.role.findUnique({
        where: { name },
      });
      if (existingRole && existingRole.id !== id) {
        throw new BadRequestException('角色名称已存在');
      }
    }

    // 验证权限菜单是否存在
    if (permissions && permissions.length > 0) {
      const menuCount = await this.prisma.menu.count({
        where: {
          id: { in: permissions },
        },
      });
      if (menuCount !== permissions.length) {
        throw new BadRequestException('部分菜单不存在');
      }
    }

    // 更新角色基本信息
    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(status !== undefined && { status }),
        ...(remark !== undefined && { remark }),
      },
    });

    // 更新权限
    if (permissions !== undefined) {
      await this.assignPermissions(id, permissions);
    }

    return updatedRole;
  }
}
