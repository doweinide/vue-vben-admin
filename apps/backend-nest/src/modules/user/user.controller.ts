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

import { PaginationDto, Public } from '../../common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UserService } from './user.service';

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
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }
}
