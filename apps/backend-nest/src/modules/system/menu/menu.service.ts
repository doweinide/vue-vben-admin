import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateMenuSchema,
  MenuNameExistsSchema,
  MenuPathExistsSchema,
  MenuQuerySchema,
  UpdateMenuSchema,
} from '@/schemas';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建菜单
   */
  async create(createMenuDto: typeof CreateMenuSchema.Type) {
    const {
      name,
      path,
      component,
      type,
      authCode,
      pid,
      status = 1,
      meta,
    } = createMenuDto;

    // 检查父菜单是否存在
    if (pid) {
      const parentMenu = await this.prisma.menu.findUnique({
        where: { id: pid },
      });
      if (!parentMenu) {
        throw new NotFoundException('父菜单不存在');
      }
    }

    // 检查菜单名称是否重复
    const existingMenuByName = await this.prisma.menu.findUnique({
      where: { name },
    });
    if (existingMenuByName) {
      throw new BadRequestException('菜单名称已存在');
    }

    // 检查路由路径是否重复（如果提供了路径）
    if (path) {
      const existingMenuByPath = await this.prisma.menu.findUnique({
        where: { path },
      });
      if (existingMenuByPath) {
        throw new BadRequestException('路由路径已存在');
      }
    }

    const menu = await this.prisma.menu.create({
      data: {
        name,
        path,
        component,
        type,
        authCode,
        pid,
        status,
        meta: meta || undefined,
      },
    });

    return {
      code: 200,
      message: '创建菜单成功',
      data: menu,
    };
  }

  /**
   * 获取菜单列表（树形结构）
   */
  async findAll(query?: typeof MenuQuerySchema.Type) {
    const where: any = {};

    if (query?.name) {
      where.name = {
        contains: query.name,
      };
    }

    if (query?.type) {
      where.type = query.type;
    }

    if (query?.status !== undefined) {
      where.status = query.status;
    }

    if (query?.pid !== undefined) {
      where.pid = query.pid;
    }

    const menus = await this.prisma.menu.findMany({
      where,
      include: {
        children: {
          include: {
            children: true,
          },
        },
        parent: true,
      },
      orderBy: [{ pid: 'asc' }, { createTime: 'desc' }],
    });

    // 构建树形结构
    const treeData = this.buildTree(menus);

    return {
      code: 200,
      message: '获取菜单列表成功',
      data: treeData,
    };
  }

  /**
   * 根据ID获取菜单详情
   */
  async findOne(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        rolePermissions: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    return {
      code: 200,
      message: '获取菜单详情成功',
      data: menu,
    };
  }

  /**
   * 检查菜单名称是否存在
   */
  async isNameExists(
    params: typeof MenuNameExistsSchema.Type,
  ): Promise<boolean> {
    const { name, id } = params;

    const existingMenu = await this.prisma.menu.findUnique({
      where: { name },
    });

    if (!existingMenu) {
      return false;
    }

    // 如果提供了ID，检查是否是同一个菜单
    if (id && existingMenu.id === id) {
      return false;
    }

    return true;
  }

  /**
   * 检查菜单路径是否存在
   */
  async isPathExists(
    params: typeof MenuPathExistsSchema.Type,
  ): Promise<boolean> {
    const { path, id } = params;

    const existingMenu = await this.prisma.menu.findUnique({
      where: { path },
    });

    if (!existingMenu) {
      return false;
    }

    // 如果提供了ID，检查是否是同一个菜单
    if (id && existingMenu.id === id) {
      return false;
    }

    return true;
  }

  /**
   * 删除菜单
   */
  async remove(id: string) {
    const menu = await this.findOne(id);

    // 检查是否有子菜单
    const childrenCount = await this.prisma.menu.count({
      where: { pid: id },
    });
    if (childrenCount > 0) {
      throw new BadRequestException('存在子菜单，无法删除');
    }

    // 检查是否有角色权限关联
    const rolePermissionsCount = await this.prisma.rolePermission.count({
      where: { menuId: id },
    });
    if (rolePermissionsCount > 0) {
      throw new BadRequestException('菜单已分配给角色，无法删除');
    }

    await this.prisma.menu.delete({
      where: { id },
    });

    return {
      code: 200,
      message: '删除菜单成功',
      data: null,
    };
  }

  /**
   * 更新菜单
   */
  async update(id: string, updateMenuDto: typeof UpdateMenuSchema.Type) {
    const menu = await this.findOne(id);

    const { name, path, component, type, authCode, pid, status, meta } =
      updateMenuDto;

    // 检查父菜单是否存在且不能设置自己为父菜单
    if (pid) {
      if (pid === id) {
        throw new BadRequestException('不能将自己设置为父菜单');
      }

      const parentMenu = await this.prisma.menu.findUnique({
        where: { id: pid },
      });
      if (!parentMenu) {
        throw new NotFoundException('父菜单不存在');
      }

      // 检查是否会形成循环引用
      const isCircular = await this.checkCircularReference(id, pid);
      if (isCircular) {
        throw new BadRequestException('不能形成循环引用');
      }
    }

    // 检查菜单名称是否重复
    if (name && name !== menu.data.name) {
      const existingMenuByName = await this.prisma.menu.findUnique({
        where: { name },
      });
      if (existingMenuByName && existingMenuByName.id !== id) {
        throw new BadRequestException('菜单名称已存在');
      }
    }

    // 检查路由路径是否重复
    if (path && path !== menu.data.path) {
      const existingMenuByPath = await this.prisma.menu.findUnique({
        where: { path },
      });
      if (existingMenuByPath && existingMenuByPath.id !== id) {
        throw new BadRequestException('路由路径已存在');
      }
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (path !== undefined) updateData.path = path;
    if (component !== undefined) updateData.component = component;
    if (type) updateData.type = type;
    if (authCode !== undefined) updateData.authCode = authCode;
    if (pid !== undefined) updateData.pid = pid || null;
    if (status !== undefined) updateData.status = status;
    if (meta !== undefined) updateData.meta = meta;

    const updatedMenu = await this.prisma.menu.update({
      where: { id },
      data: updateData,
    });

    return {
      code: 200,
      message: '更新菜单成功',
      data: updatedMenu,
    };
  }

  /**
   * 构建树形结构
   */
  private buildTree(menus: any[]): any[] {
    const map = new Map();
    const roots: any[] = [];

    // 创建映射
    menus.forEach((menu) => {
      map.set(menu.id, { ...menu, children: [] });
    });

    // 构建树形结构
    menus.forEach((menu) => {
      const node = map.get(menu.id);
      if (menu.pid) {
        const parent = map.get(menu.pid);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * 检查循环引用
   */
  private async checkCircularReference(
    menuId: string,
    parentId: string,
  ): Promise<boolean> {
    let currentId = parentId;
    const visited = new Set<string>();

    while (currentId) {
      if (visited.has(currentId) || currentId === menuId) {
        return true;
      }
      visited.add(currentId);

      const parent = await this.prisma.menu.findUnique({
        where: { id: currentId },
        select: { pid: true },
      });

      currentId = parent?.pid || '';
    }

    return false;
  }
}
