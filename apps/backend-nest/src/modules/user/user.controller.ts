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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { PaginationDto, Public } from '../../common';
import { 
  CreateUserDto, 
  UpdateUserDto,
  UserResponseDto,
  CreateUserResponseDto,
  UpdateUserResponseDto,
  DeleteUserResponseDto,
  PaginatedUsersResponseDto,
} from './dto';
import { UserService } from './user.service';

/**
 * 用户控制器
 *
 * 处理用户管理相关的 HTTP 请求
 * 提供用户的 CRUD 操作接口
 *
 * 路由前缀: /users
 */
@ApiTags('用户管理')
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
  @ApiOperation({ 
    summary: '创建用户', 
    description: '创建新用户账户，公共接口允许用户注册' 
  })
  @ApiBody({ 
    type: CreateUserDto,
    description: '用户创建信息',
  })
  @ApiResponse({ 
    status: 201, 
    description: '用户创建成功',
    type: CreateUserResponseDto,
  })
  @ApiResponse({ 
    status: 400, 
    description: '请求参数错误' 
  })
  @ApiResponse({ 
    status: 409, 
    description: '用户名或邮箱已存在' 
  })
  @Post()
  @Public()
  create(@Body() createUserDto: CreateUserDto) {
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
  @ApiOperation({ 
    summary: '获取用户列表', 
    description: '分页查询用户列表，需要认证' 
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: '页码，默认为1' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: '每页数量，默认为10' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '获取用户列表成功',
    type: PaginatedUsersResponseDto,
  })
  @ApiResponse({ 
    status: 401, 
    description: '未授权访问' 
  })
  @ApiBearerAuth()
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
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
  @ApiOperation({ 
    summary: '获取用户详情', 
    description: '根据用户ID获取用户详细信息，需要认证' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: '用户ID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '获取用户详情成功',
    type: UserResponseDto,
  })
  @ApiResponse({ 
    status: 401, 
    description: '未授权访问' 
  })
  @ApiResponse({ 
    status: 404, 
    description: '用户不存在' 
  })
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
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
  @ApiOperation({ 
    summary: '删除用户', 
    description: '删除指定用户，需要认证和管理员权限' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: '用户ID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '用户删除成功',
    type: DeleteUserResponseDto,
  })
  @ApiResponse({ 
    status: 401, 
    description: '未授权访问' 
  })
  @ApiResponse({ 
    status: 403, 
    description: '权限不足' 
  })
  @ApiResponse({ 
    status: 404, 
    description: '用户不存在' 
  })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
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
  @ApiOperation({ 
    summary: '更新用户信息', 
    description: '更新指定用户信息，需要认证' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: '用户ID' 
  })
  @ApiBody({ 
    type: UpdateUserDto,
    description: '用户更新信息',
  })
  @ApiResponse({ 
    status: 200, 
    description: '用户信息更新成功',
    type: UpdateUserResponseDto,
  })
  @ApiResponse({ 
    status: 400, 
    description: '请求参数错误' 
  })
  @ApiResponse({ 
    status: 401, 
    description: '未授权访问' 
  })
  @ApiResponse({ 
    status: 403, 
    description: '权限不足' 
  })
  @ApiResponse({ 
    status: 404, 
    description: '用户不存在' 
  })
  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }
}
