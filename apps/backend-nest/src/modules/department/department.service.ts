import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateDepartmentSchema,
  DepartmentQuerySchema,
  UpdateDepartmentSchema,
} from '../../schemas';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建部门
   */
  async create(createDepartmentDto: typeof CreateDepartmentSchema.Type) {
    const { name, pid, status = 1, remark } = createDepartmentDto;

    // 检查父部门是否存在
    if (pid) {
      const parentDept = await this.prisma.department.findUnique({
        where: { id: pid },
      });
      if (!parentDept) {
        throw new NotFoundException('父部门不存在');
      }
    }

    // 检查同级部门名称是否重复
    const existingDept = await this.prisma.department.findFirst({
      where: {
        name,
        pid,
      },
    });
    if (existingDept) {
      throw new BadRequestException('同级部门名称不能重复');
    }

    const department = await this.prisma.department.create({
      data: {
        name,
        pid,
        status,
        remark,
      },
    });

    return {
      code: 200,
      message: '创建部门成功',
      data: department,
    };
  }

  /**
   * 获取部门列表（树形结构）
   */
  async findAll(query?: typeof DepartmentQuerySchema.Type) {
    const where: any = {};

    if (query?.name) {
      where.name = {
        contains: query.name,
      };
    }

    if (query?.status !== undefined) {
      where.status = query.status;
    }

    if (query?.pid !== undefined) {
      where.pid = query.pid;
    }

    const departments = await this.prisma.department.findMany({
      where,
      include: {
        children: {
          include: {
            children: true,
          },
        },
        parent: true,
      },
      orderBy: {
        createTime: 'desc',
      },
    });

    // 构建树形结构
    const treeData = this.buildTree(departments);

    return {
      code: 200,
      message: '获取部门列表成功',
      data: treeData,
    };
  }

  /**
   * 根据ID获取部门详情
   */
  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        users: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('部门不存在');
    }

    return {
      code: 200,
      message: '获取部门详情成功',
      data: department,
    };
  }

  /**
   * 删除部门
   */
  async remove(id: string): Promise<void> {
    const department = await this.findOne(id);

    // 检查是否有子部门
    const childrenCount = await this.prisma.department.count({
      where: { pid: id },
    });
    if (childrenCount > 0) {
      throw new BadRequestException('存在子部门，无法删除');
    }

    // 检查是否有用户
    const usersCount = await this.prisma.user.count({
      where: { deptId: id },
    });
    if (usersCount > 0) {
      throw new BadRequestException('部门下存在用户，无法删除');
    }

    await this.prisma.department.delete({
      where: { id },
    });
  }

  /**
   * 更新部门
   */
  async update(
    id: string,
    updateDepartmentDto: typeof UpdateDepartmentSchema.Type,
  ) {
    const departmentResult = await this.findOne(id);
    const department = departmentResult.data; // 从三段式响应中获取数据

    const { name, pid, status, remark } = updateDepartmentDto;

    // 检查父部门是否存在且不能设置自己为父部门
    if (pid) {
      if (pid === id) {
        throw new BadRequestException('不能将自己设置为父部门');
      }

      const parentDept = await this.prisma.department.findUnique({
        where: { id: pid },
      });
      if (!parentDept) {
        throw new NotFoundException('父部门不存在');
      }

      // 检查是否会形成循环引用
      const isCircular = await this.checkCircularReference(id, pid);
      if (isCircular) {
        throw new BadRequestException('不能形成循环引用');
      }
    }

    // 检查同级部门名称是否重复
    if (name && name !== department.name) {
      const existingDept = await this.prisma.department.findFirst({
        where: {
          name,
          pid: pid === undefined ? department.pid : pid || null,
          id: { not: id },
        },
      });
      if (existingDept) {
        throw new BadRequestException('同级部门名称不能重复');
      }
    }

    const updatedDepartment = await this.prisma.department.update({
      where: { id },
      data: {
        name: name || department.name,
        pid: pid === undefined ? department.pid : pid || null,
        status: status === undefined ? department.status : status,
        remark: remark === undefined ? department.remark : remark,
      },
    });

    return {
      code: 200,
      message: '更新部门成功',
      data: updatedDepartment,
    };
  }

  /**
   * 构建树形结构
   */
  private buildTree(departments: any[]): any[] {
    const map = new Map();
    const roots: any[] = [];

    // 创建映射
    departments.forEach((dept) => {
      map.set(dept.id, { ...dept, children: [] });
    });

    // 构建树形结构
    departments.forEach((dept) => {
      const node = map.get(dept.id);
      if (dept.pid) {
        const parent = map.get(dept.pid);
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
    deptId: string,
    parentId: string,
  ): Promise<boolean> {
    let currentId = parentId;
    const visited = new Set<string>();

    while (currentId) {
      if (visited.has(currentId) || currentId === deptId) {
        return true;
      }
      visited.add(currentId);

      const parent = await this.prisma.department.findUnique({
        where: { id: currentId },
        select: { pid: true },
      });

      currentId = parent?.pid || '';
    }

    return false;
  }
}
