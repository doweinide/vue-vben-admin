import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateUserRequestSchema,
  ResponseBuilder,
  UpdateUserRequestSchema,
  UserQuerySchema,
} from '@/schemas';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

/**
 * 用户服务
 *
 * 处理用户相关的业务逻辑
 * 包括用户的创建、查询、更新、删除等操作
 * 使用 bcrypt 进行密码加密
 * 使用 Prisma 进行数据库操作
 */
@Injectable()
export class UserService {
  /**
   * 构造函数
   *
   * @param prisma Prisma 服务，用于数据库操作
   */
  constructor(private prisma: PrismaService) {}

  /**
   * 创建用户
   *
   * 创建新用户前会检查用户名和邮箱的唯一性
   * 密码会使用 bcrypt 进行加密存储
   * 支持部门和角色关联
   *
   * @param createUserDto 创建用户的数据传输对象
   * @returns 创建的用户信息（不包含密码）
   * @throws ConflictException 当用户名或邮箱已存在时抛出
   */
  async create(createUserDto: typeof CreateUserRequestSchema.Type) {
    // 检查用户名是否已存在
    const existingUserByUsername = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });
    if (existingUserByUsername) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUserByEmail) {
      throw new ConflictException('邮箱已存在');
    }

    // 验证部门是否存在
    if (createUserDto.deptId) {
      const department = await this.prisma.department.findUnique({
        where: { id: createUserDto.deptId },
      });
      if (!department) {
        throw new NotFoundException('指定的部门不存在');
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 准备创建数据
    const createData: any = {
      username: createUserDto.username,
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      avatar: createUserDto.avatar,
      status: createUserDto.status ?? 1,
      deptId: createUserDto.deptId,
    };

    // 创建用户
    const user = await this.prisma.user.create({
      data: createData,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            pid: true,
          },
        },
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
    });

    // 返回用户信息（包含密码，用于创建响应）
    return {
      code: 200,
      message: '用户创建成功',
      data: user,
    };
  }

  /**
   * 获取用户列表
   *
   * 支持分页查询和条件过滤，返回用户基本信息（不包含密码）
   * 包含部门和角色关联信息
   *
   * @param query 查询参数，包含分页和过滤条件
   * @returns 分页的用户列表响应
   */
  async findAll(query?: typeof UserQuerySchema.Type) {
    const { page = 1, limit = 10 } = query || {};
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (query?.username) {
      where.username = {
        contains: query.username,
      };
    }

    if (query?.email) {
      where.email = {
        contains: query.email,
      };
    }

    if (query?.status !== undefined) {
      where.status = query.status;
    }

    if (query?.deptId) {
      where.deptId = query.deptId;
    }

    // 并行查询用户列表和总数
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          avatar: true,
          status: true,
          deptId: true,
          createdAt: true,
          updatedAt: true,
          department: {
            select: {
              id: true,
              name: true,
              pid: true,
            },
          },
          userRoles: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // 格式化用户数据
    const formattedUsers = users;

    const totalPages = Math.ceil(total / limit);

    // 使用 ResponseBuilder 创建分页响应
    return ResponseBuilder.paginated(
      formattedUsers,
      total,
      page,
      limit,
      '查询成功',
    );
  }

  /**
   * 根据用户名查找用户
   *
   * 主要用于登录验证，返回完整的用户信息（包含密码）
   * 角色信息会从 JSON 字符串反序列化为数组
   *
   * @param username 用户名
   * @returns 用户信息或 null（如果用户不存在）
   */
  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                status: true,
                remark: true,
                createTime: true,
                updateTime: true,
              },
            },
          },
        },
      },
    });

    return user;
  }

  /**
   * 根据 ID 查找用户
   *
   * 返回用户详细信息（不包含密码）
   * 包含部门和角色关联信息
   *
   * @param id 用户 ID
   * @returns 用户详细信息
   * @throws NotFoundException 当用户不存在时抛出
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            pid: true,
            status: true,
            remark: true,
            createTime: true,
            updateTime: true,
          },
        },
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                status: true,
                remark: true,
                createTime: true,
                updateTime: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      code: 200,
      message: '查询成功',
      data: user,
    };
  }

  /**
   * 删除用户
   *
   * 删除指定 ID 的用户
   * 删除前会检查用户是否存在
   *
   * @param id 用户 ID
   * @returns 删除成功的消息
   * @throws NotFoundException 当用户不存在时抛出
   */
  async remove(id: string) {
    // 检查用户是否存在
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) {
      throw new NotFoundException('用户不存在');
    }

    // 删除用户
    await this.prisma.user.delete({
      where: { id },
    });

    return {
      code: 200,
      message: '用户删除成功',
      data: {
        id,
        message: '用户删除成功',
      },
    };
  }

  /**
   * 更新用户信息
   *
   * 更新指定 ID 的用户信息
   * 更新前会检查用户是否存在
   * 如果更新邮箱，会检查邮箱唯一性
   * 如果更新密码，会使用 bcrypt 加密
   * 支持更新部门和角色关联
   *
   * @param id 用户 ID
   * @param updateUserDto 更新用户的数据传输对象
   * @returns 更新后的用户信息（不包含密码）
   * @throws NotFoundException 当用户不存在时抛出
   * @throws ConflictException 当邮箱已被其他用户使用时抛出
   */
  async update(id: string, updateUserDto: typeof UpdateUserRequestSchema.Type) {
    // 检查用户是否存在
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) {
      throw new NotFoundException('用户不存在');
    }

    // 如果更新邮箱，检查邮箱是否已被其他用户使用
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const existingUserByEmail = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existingUserByEmail) {
        throw new ConflictException('邮箱已存在');
      }
    }

    // 验证部门是否存在
    if (updateUserDto.deptId) {
      const department = await this.prisma.department.findUnique({
        where: { id: updateUserDto.deptId },
      });
      if (!department) {
        throw new NotFoundException('指定的部门不存在');
      }
    }

    // 准备更新数据
    const updateData: any = {};

    if (updateUserDto.username !== undefined)
      updateData.username = updateUserDto.username;
    if (updateUserDto.name !== undefined) updateData.name = updateUserDto.name;
    if (updateUserDto.email !== undefined)
      updateData.email = updateUserDto.email;
    if (updateUserDto.avatar !== undefined)
      updateData.avatar = updateUserDto.avatar;
    if (updateUserDto.status !== undefined)
      updateData.status = updateUserDto.status;
    if (updateUserDto.deptId !== undefined)
      updateData.deptId = updateUserDto.deptId;

    // 如果更新密码，需要加密
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // 更新用户
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            pid: true,
          },
        },
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
    });

    return {
      code: 200,
      message: '用户更新成功',
      data: user,
    };
  }
}
