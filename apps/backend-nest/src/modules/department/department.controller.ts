import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';

import {
  ApiDelete,
  ApiGet,
  ApiPatch,
  ApiPost,
} from '../../decorators/api.decorator';
import {
  CreateDepartmentSchema,
  DepartmentQuerySchema,
  DepartmentResponseSchema,
  IdParamSchema,
  UpdateDepartmentSchema,
} from '../../schemas';
import { DepartmentService } from './department.service';

@Controller('system/dept')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @ApiPost({
    path: '',
    summary: '创建部门',
    description: '创建新的部门',
    tags: ['部门管理'],
    bodySchema: CreateDepartmentSchema,
    responseSchema: DepartmentResponseSchema,
  })
  async create(
    @Body() createDepartmentDto: typeof CreateDepartmentSchema.Type,
  ) {
    return this.departmentService.create(createDepartmentDto);
  }

  @ApiGet({
    path: 'list',
    summary: '获取部门列表',
    description: '获取部门列表，支持筛选条件',
    tags: ['部门管理'],
    querySchema: DepartmentQuerySchema,
    responseSchema: DepartmentResponseSchema,
  })
  async findAll(@Query() query: typeof DepartmentQuerySchema.Type) {
    return this.departmentService.findAll(query);
  }

  @ApiGet({
    path: ':id',
    summary: '获取部门详情',
    description: '根据ID获取部门详情',
    tags: ['部门管理'],
    paramSchema: IdParamSchema,
    responseSchema: DepartmentResponseSchema,
  })
  async findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDelete({
    path: ':id',
    summary: '删除部门',
    description: '删除指定ID的部门',
    tags: ['部门管理'],
    paramSchema: IdParamSchema,
  })
  async remove(@Param('id') id: string) {
    await this.departmentService.remove(id);
  }

  @ApiPatch({
    path: ':id',
    summary: '更新部门',
    description: '更新指定ID的部门信息',
    tags: ['部门管理'],
    paramSchema: IdParamSchema,
    bodySchema: UpdateDepartmentSchema,
    responseSchema: DepartmentResponseSchema,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: typeof UpdateDepartmentSchema.Type,
  ) {
    return this.departmentService.update(id, updateDepartmentDto);
  }
}
