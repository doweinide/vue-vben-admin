import type {
  CreateRoleDto,
  RoleNameCheckDto,
  RolePermissionDto,
  RoleQueryDto,
  UpdateRoleDto,
} from '../../schemas/role.schema';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import {
  ApiDelete,
  ApiGet,
  ApiPatch,
  ApiPost,
} from '../../decorators/api.decorator';
import { IdParamSchema } from '../../schemas/base.schema';
import {
  CreateRoleSchema,
  RoleNameCheckSchema,
  RolePermissionSchema,
  RoleQuerySchema,
  RoleResponseSchema,
  UpdateRoleSchema,
} from '../../schemas/role.schema';
import { RoleService } from './role.service';

/**
 * 角色控制器
 *
 * 处理角色管理相关的 HTTP 请求
 * 提供角色的 CRUD 操作接口和权限管理
 *
 * 路由前缀: /roles
 */
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post(':id/permissions')
  @ApiPost({
    path: '/:id/permissions',
    summary: '分配角色权限',
    description: '为角色分配菜单权限',
    tags: ['角色管理'],
    paramSchema: IdParamSchema,
    bodySchema: RolePermissionSchema,
  })
  async assignPermissions(
    @Param('id') id: string,
    @Body() rolePermissionDto: RolePermissionDto,
  ) {
    await this.roleService.assignPermissions(id, rolePermissionDto.menuIds);
    return { message: '权限分配成功' };
  }

  @Post('check-name')
  @ApiPost({
    path: '/check-name',
    summary: '检查角色名称是否存在',
    description: '检查指定的角色名称是否已存在',
    tags: ['角色管理'],
    bodySchema: RoleNameCheckSchema,
  })
  checkNameExists(@Body() roleNameCheckDto: RoleNameCheckDto) {
    return { exists: false };
  }

  @Post()
  @ApiPost({
    path: '',
    summary: '创建角色',
    description: '创建新的角色',
    tags: ['角色管理'],
    bodySchema: CreateRoleSchema,
    responseSchema: RoleResponseSchema,
  })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiGet({
    path: '',
    summary: '获取角色列表',
    description: '获取角色列表，支持分页和搜索',
    tags: ['角色管理'],
    querySchema: RoleQuerySchema,
    responseSchema: RoleResponseSchema,
  })
  findAll(@Query() query: RoleQueryDto) {
    return this.roleService.findAll(query);
  }

  @Get(':id')
  @ApiGet({
    path: '/:id',
    summary: '获取角色详情',
    description: '根据ID获取角色详情',
    tags: ['角色管理'],
    paramSchema: IdParamSchema,
    responseSchema: RoleResponseSchema,
  })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Get(':id/permissions')
  @ApiGet({
    path: '/:id/permissions',
    summary: '获取角色权限',
    description: '获取角色的菜单权限列表',
    tags: ['角色管理'],
    paramSchema: IdParamSchema,
  })
  getPermissions(@Param('id') id: string) {
    return this.roleService.getRolePermissions(id);
  }

  @Delete(':id')
  @ApiDelete({
    path: '/:id',
    summary: '删除角色',
    description: '根据ID删除角色',
    tags: ['角色管理'],
    paramSchema: IdParamSchema,
  })
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }

  @Patch(':id')
  @ApiPatch({
    path: '/:id',
    summary: '更新角色',
    description: '根据ID更新角色信息',
    tags: ['角色管理'],
    paramSchema: IdParamSchema,
    bodySchema: UpdateRoleSchema,
    responseSchema: RoleResponseSchema,
  })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }
}
