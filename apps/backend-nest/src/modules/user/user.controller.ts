import type { PaginationQuery } from '../../schemas/base.schema';
import type {
  CreateUserRequest,
  UpdateUserRequest,
} from '../../schemas/user.schema';

import { Body, Controller, Param, Query } from '@nestjs/common';
import { z } from 'zod';

import { Public } from '../../common';
import {
  ApiDelete,
  ApiGet,
  ApiPatch,
  ApiPost,
} from '../../decorators/api.decorator';
import { IdParamSchema, PaginationSchema } from '../../schemas/base.schema';
import {
  CreateUserRequestSchema,
  CreateUserResponseSchema,
  DeleteUserResponseSchema,
  PaginatedUsersResponseSchema,
  UpdateUserRequestSchema,
  UpdateUserResponseSchema,
  UserResponseSchema,
} from '../../schemas/user.schema';
import { UserService } from './user.service';

// 分页用户响应 Schema - 直接使用工厂函数生成的完整响应结构
const PaginatedUsersApiResponseSchema = PaginatedUsersResponseSchema;

// 类型定义
type UserResponse = z.infer<typeof UserResponseSchema>;
type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;
type DeleteUserResponse = z.infer<typeof DeleteUserResponseSchema>;
type PaginatedUsersApiResponse = z.infer<
  typeof PaginatedUsersApiResponseSchema
>;

/**
 * 用户控制器
 *
 * 处理用户管理相关的 HTTP 请求
 * 提供用户的 CRUD 操作接口
 *
 * 路由前缀: /users
 */
@Controller('users')
export class UserController {
  /**
   * 构造函数
   *
   * @param userService 用户服务，处理用户业务逻辑
   */
  constructor(private readonly userService: UserService) {}

  /**
   * 创建用户
   *
   * 公共接口，允许用户注册
   *
   * @param createUserDto 创建用户数据传输对象
   * @returns 创建的用户信息
   */
  @Public()
  @ApiPost({
    path: '',
    summary: '创建用户',
    description: '创建新用户账户，公共接口允许用户注册',
    tags: ['用户管理'],
    bodySchema: CreateUserRequestSchema,
    responseSchema: CreateUserResponseSchema,
  })
  create(
    @Body() createUserDto: CreateUserRequest,
  ): Promise<CreateUserResponse> {
    return this.userService.create(createUserDto);
  }

  /**
   * 获取用户列表
   *
   * 支持分页查询，返回用户基本信息（不包含密码）
   * 角色信息会从 JSON 字符串反序列化为数组
   *
   * @param paginationQuery 分页查询参数
   * @returns 分页的用户列表响应
   *
   * @example
   * GET /users?page=1&limit=10
   */
  @ApiGet({
    path: '',
    summary: '获取用户列表',
    description: '支持分页查询，返回用户基本信息（不包含密码）',
    tags: ['用户管理'],
    responseSchema: PaginatedUsersApiResponseSchema,
    querySchema: PaginationSchema,
    requireAuth: true,
  })
  async findAll(@Query() paginationQuery: PaginationQuery) {
    return this.userService.findAll(paginationQuery);
  }

  /**
   * 根据 ID 获取用户详情
   *
   * 需要认证
   *
   * @param id 用户 ID
   * @returns 用户详细信息
   *
   * @example
   * GET /users/1
   */
  @ApiGet({
    path: ':id',
    summary: '获取用户详情',
    description: '根据用户ID获取用户详细信息，需要认证',
    tags: ['用户管理'],
    paramSchema: IdParamSchema,
    responseSchema: UserResponseSchema,
    requireAuth: true,
  })
  findOne(@Param('id') id: string): Promise<UserResponse> {
    return this.userService.findOne(id);
  }

  /**
   * 删除用户
   *
   * 需要认证，通常需要管理员权限
   *
   * @param id 用户 ID
   * @returns 删除结果
   *
   * @example
   * DELETE /users/1
   */
  @ApiDelete({
    path: ':id',
    summary: '删除用户',
    description: '删除指定用户，需要认证和管理员权限',
    tags: ['用户管理'],
    paramSchema: IdParamSchema,
    responseSchema: DeleteUserResponseSchema,
    requireAuth: true,
  })
  remove(@Param('id') id: string): Promise<DeleteUserResponse> {
    return this.userService.remove(id);
  }

  /**
   * 更新用户信息
   *
   * 需要认证，用户只能更新自己的信息或管理员可以更新任意用户
   *
   * @param id 用户 ID
   * @param updateUserDto 更新用户数据传输对象
   * @returns 更新后的用户信息
   *
   * @example
   * PATCH /users/1
   * {
   *   "email": "newemail@example.com",
   *   "isActive": false
   * }
   */
  @ApiPatch({
    path: ':id',
    summary: '更新用户信息',
    description: '更新指定用户的信息，需要认证',
    tags: ['用户管理'],
    paramSchema: IdParamSchema,
    bodySchema: UpdateUserRequestSchema,
    responseSchema: UpdateUserResponseSchema,
    requireAuth: true,
  })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    return this.userService.update(id, updateUserDto);
  }
}
