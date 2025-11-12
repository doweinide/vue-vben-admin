import { PrismaService } from '@/prisma/prisma.service';
import {
  BatchMenuSyncSchema,
  BatchMenuSyncStatusOrResultResponseSchema,
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
  // 同步状态锁，防止并发重复同步
  private isSyncing = false;
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
   * 批量同步菜单（智能同步）
   * - 只更新变化的菜单
   * - 新增前端提供但不存在的菜单
   * - 删除前端未提供的菜单（保留 type==='button'）
   * 支持请求体为数组或 { menus: [] }
   */
  async syncBatch(
    payload: typeof BatchMenuSyncSchema.Type,
  ): Promise<typeof BatchMenuSyncStatusOrResultResponseSchema.Type> {
    // 如果正在同步，直接提示进行中
    if (this.isSyncing) {
      return {
        code: 200,
        message: '菜单同步进行中，请稍等',
        data: { status: 'running' },
      };
    }

    // 基础请求体验证（快速失败）
    const inputTrees: any[] = Array.isArray(payload)
      ? payload
      : payload?.menus || [];
    if (!Array.isArray(inputTrees)) {
      throw new BadRequestException('请求体格式错误：应为数组或 {menus: []}');
    }

    // 设置同步锁，并在后台执行真实同步逻辑
    this.isSyncing = true;
    setImmediate(async () => {
      try {
        await this.syncBatchInternal(payload);
      } catch (error) {
        // 后台错误只记录日志
        console.error('[MenuSync] 后台同步失败:', error);
      } finally {
        this.isSyncing = false;
      }
    });

    return {
      code: 200,
      message: '已开始后台同步菜单',
      data: { status: 'started' },
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

  // 后台执行的真实同步逻辑（保留原有实现）
  private async syncBatchInternal(payload: typeof BatchMenuSyncSchema.Type) {
    // 采用单次预取与内存映射，减少数据库查询次数
    const inputTrees: any[] = Array.isArray(payload)
      ? payload
      : payload?.menus || [];
    if (!Array.isArray(inputTrees)) {
      throw new BadRequestException('请求体格式错误：应为数组或 {menus: []}');
    }

    // 收集所有节点并做基础校验（名称/路径唯一）
    const allNodes: any[] = [];
    const collect = (nodes: any[]) => {
      for (const n of nodes || []) {
        allNodes.push(n);
        if (Array.isArray(n.children) && n.children.length > 0)
          collect(n.children);
      }
    };
    collect(inputTrees);

    const nameSet = new Set<string>();
    const pathSet = new Set<string>();
    for (const n of allNodes) {
      if (!n?.name) throw new BadRequestException('菜单项缺少必填字段 name');
      if (nameSet.has(n.name)) {
        throw new BadRequestException(
          `同步数据中存在重复的菜单名称: ${n.name}`,
        );
      }
      nameSet.add(n.name);
      const p = n.path ?? undefined;
      if (p) {
        if (pathSet.has(p)) {
          throw new BadRequestException(`同步数据中存在重复的路由路径: ${p}`);
        }
        pathSet.add(p);
      }
    }

    // 一次性读取现有菜单，构建 name -> menu 映射
    const existingMenus = await this.prisma.menu.findMany({
      select: {
        id: true,
        name: true,
        path: true,
        component: true,
        type: true,
        authCode: true,
        pid: true,
        status: true,
        meta: true,
      },
    });
    const byName = new Map<string, any>();
    for (const m of existingMenus) byName.set(m.name, m);

    const logs: string[] = [];
    let createdCount = 0;
    let updatedCount = 0;
    let deletedCount = 0;

    // 递归处理：使用映射判断是否存在，调用 upsert 降低往返
    const processNode = async (
      node: any,
      parentId: null | string,
    ): Promise<string> => {
      const exists = byName.get(node.name);
      const data: any = {
        name: node.name,
        path: node.path ?? undefined,
        component: node.component ?? undefined,
        type: node.type,
        authCode: node.authCode ?? undefined,
        pid: parentId ?? null,
        status: node.status ?? exists?.status ?? 1,
        meta: node.meta ?? undefined,
      };

      // 使用 upsert 减少一次查询
      const saved = await this.prisma.menu.upsert({
        where: { name: node.name },
        update: data,
        create: data,
      });

      // 记录日志与计数（通过映射判断是否为创建）
      if (exists) {
        updatedCount++;
        logs.push(`更新菜单: ${saved.name} (${saved.id})`);
      } else {
        createdCount++;
        logs.push(`创建菜单: ${saved.name} (${saved.id})`);
      }

      // 更新映射以供后续子节点使用
      byName.set(saved.name, saved);

      if (Array.isArray(node.children) && node.children.length > 0) {
        for (const child of node.children) {
          await processNode(child, saved.id);
        }
      }
      return saved.id;
    };

    for (const root of inputTrees) {
      await processNode(root, null);
    }

    // 计算需要删除的旧菜单，并批量删除
    const toDelete = existingMenus.filter(
      (e) => e.type !== 'button' && !nameSet.has(e.name),
    );
    if (toDelete.length > 0) {
      const ids = toDelete.map((e) => e.id);
      const names = toDelete.map((e) => e.name);
      const res = await this.prisma.menu.deleteMany({
        where: { id: { in: ids } },
      });
      deletedCount += res.count;
      for (const n of names) logs.push(`删除菜单: ${n}`);
    }

    // 后台执行仅记录日志摘要
    console.log(
      `[MenuSync] 完成: created=${createdCount}, updated=${updatedCount}, deleted=${deletedCount}`,
    );
    if (logs.length > 0) console.log('[MenuSync] 详情:', logs.join('\n'));
  }
}
