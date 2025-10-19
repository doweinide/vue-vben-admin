import type {
  CreateUserRequest,
  UpdateUserRequest,
} from '../../schemas/user.schema';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';

import { Public } from '../../common';
import {
  ApiDelete,
  ApiGet,
  ApiPatch,
  ApiPost,
} from '../../decorators/api.decorator';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import {
  BaseResponseSchema,
  PaginationSchema,
} from '../../schemas/base.schema';
import {
  CreateUserRequestSchema,
  PaginatedUsersResponseSchema,
  UpdateUserRequestSchema,
  UserSchema,
} from '../../schemas/user.schema';
import { UserService } from './user.service';

// 用户响应 Schema
const UserResponseSchema = BaseResponseSchema.extend({
  data: UserSchema,
});

// 创建用户响应 Schema
const CreateUserResponseSchema = BaseResponseSchema.extend({
  data: UserSchema,
});

// 更新用户响应 Schema
const UpdateUserResponseSchema = BaseResponseSchema.extend({
  data: UserSchema,
});

// 删除用户响应 Schema
const DeleteUserResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    id: z.number(),
    message: z.string(),
  }),
});

// 分页用户响应 Schema
const PaginatedUsersApiResponseSchema = BaseResponseSchema.extend({
  data: PaginatedUsersResponseSchema,
});

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
   *
   * @example
   * POST /users
   * {
   *   "username": "newuser",
   *   "email": "user@example.com",
   *   "password": "123456"
   * }
   */
  @Public()
  @Post()
  @ApiPost({
    path: '/',
    summary: '创建用户',
    description: '创建新用户账户，公共接口允许用户注册',
    tags: ['用户管理'],
    bodySchema: CreateUserRequestSchema,
    responseSchema: CreateUserResponseSchema,
  })
  @UsePipes(new ZodValidationPipe(CreateUserRequestSchema))
  create(
    @Body() createUserDto: CreateUserRequest,
  ): Promise<CreateUserResponse> {
    return this.userService.create(createUserDto);
  }

  /**
   * 获取用户列表
   *
   * 支持分页查询
   * 需要认证
   *
   * @param paginationDto 分页查询参数
   * @returns 分页的用户列表
   *
   * @example
   * GET /users?page=1&limit=10
   */
  @Get()
  @ApiGet({
    path: '/',
    summary: '获取用户列表',
    description: '分页查询用户列表，需要认证',
    tags: ['用户管理'],
    querySchema: PaginationSchema,
    responseSchema: PaginatedUsersApiResponseSchema,
    requireAuth: true,
  })
  @UsePipes(new ZodValidationPipe(PaginationSchema))
  findAll(
    @Query() paginationDto: z.infer<typeof PaginationSchema>,
  ): Promise<PaginatedUsersApiResponse> {
    return this.userService.findAll(paginationDto);
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
  @Get(':id')
  @ApiGet({
    path: '/:id',
    summary: '获取用户详情',
    description: '根据用户ID获取用户详细信息，需要认证',
    tags: ['用户管理'],
    responseSchema: UserResponseSchema,
    requireAuth: true,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponse> {
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
  @Delete(':id')
  @ApiDelete({
    path: '/:id',
    summary: '删除用户',
    description: '删除指定用户，需要认证和管理员权限',
    tags: ['用户管理'],
    responseSchema: DeleteUserResponseSchema,
    requireAuth: true,
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteUserResponse> {
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
  @Patch(':id')
  @ApiPatch({
    path: '/:id',
    summary: '更新用户信息',
    description: '更新指定用户信息，需要认证',
    tags: ['用户管理'],
    bodySchema: UpdateUserRequestSchema,
    responseSchema: UpdateUserResponseSchema,
    requireAuth: true,
  })
  @UsePipes(new ZodValidationPipe(UpdateUserRequestSchema))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    return this.userService.update(id, updateUserDto);
  }
}
