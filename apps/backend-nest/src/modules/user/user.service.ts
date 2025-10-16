import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { PaginationDto, PaginationResponseDto } from '../../common/dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
   * 角色信息会序列化为 JSON 字符串存储
   *
   * @param createUserDto 创建用户的数据传输对象
   * @returns 创建的用户信息（不包含密码）
   * @throws ConflictException 当用户名或邮箱已存在时抛出
   */
  async create(createUserDto: CreateUserDto) {
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

    // 加密密码
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        roles: JSON.stringify(createUserDto.roles || ['user']),
      },
    });

    // 返回用户信息（不包含密码）
    const { password: _, ...result } = user;
    return {
      ...result,
      roles: JSON.parse(user.roles),
    };
  }

  /**
   * 获取用户列表
   *
   * 支持分页查询，返回用户基本信息（不包含密码）
   * 角色信息会从 JSON 字符串反序列化为数组
   *
   * @param paginationDto 分页查询参数
   * @returns 分页的用户列表响应
   */
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // 并行查询用户列表和总数
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          isActive: true,
          roles: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    // 格式化用户数据，反序列化角色信息
    const formattedUsers = users.map((user) => ({
      ...user,
      roles: JSON.parse(user.roles),
    }));

    return new PaginationResponseDto(formattedUsers, total, page, limit);
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
    });

    if (user) {
      return {
        ...user,
        roles: JSON.parse(user.roles),
      };
    }

    return user;
  }

  /**
   * 根据 ID 查找用户
   *
   * 返回用户详细信息（不包含密码）
   * 角色信息会从 JSON 字符串反序列化为数组
   *
   * @param id 用户 ID
   * @returns 用户详细信息
   * @throws NotFoundException 当用户不存在时抛出
   */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        isActive: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      ...user,
      roles: JSON.parse(user.roles),
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
  async remove(id: number) {
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

    return { message: '用户删除成功' };
  }

  /**
   * 更新用户信息
   *
   * 更新指定 ID 的用户信息
   * 更新前会检查用户是否存在
   * 如果更新邮箱，会检查邮箱唯一性
   * 如果更新密码，会使用 bcrypt 加密
   * 如果更新角色，会序列化为 JSON 字符串
   *
   * @param id 用户 ID
   * @param updateUserDto 更新用户的数据传输对象
   * @returns 更新后的用户信息（不包含密码）
   * @throws NotFoundException 当用户不存在时抛出
   * @throws ConflictException 当邮箱已被其他用户使用时抛出
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
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

    // 如果更新密码，需要加密
    const updateData: any = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // 如果更新角色，需要序列化
    if (updateUserDto.roles) {
      updateData.roles = JSON.stringify(updateUserDto.roles);
    }

    // 更新用户
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        isActive: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...user,
      roles: JSON.parse(user.roles),
    };
  }
}
