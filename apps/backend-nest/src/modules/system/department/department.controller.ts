import {
  ApiDelete,
  ApiGet,
  ApiPatch,
  ApiPost,
} from '@/decorators/api.decorator';
import { ZodBody, ZodParam, ZodQuery } from '@/decorators/zod-param.decorator';
import {
  CreateDepartmentSchema,
  DepartmentQuerySchema,
  DepartmentResponseSchema,
  IdParamSchema,
  UpdateDepartmentSchema,
} from '@/schemas';
import { Controller, HttpCode, HttpStatus } from '@nestjs/common';

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
    @ZodBody() createDepartmentDto: typeof CreateDepartmentSchema.Type,
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
  async findAll(@ZodQuery() query: typeof DepartmentQuerySchema.Type) {
    console.log('Received query:', query);
    console.log('Type of query.status:', typeof query.status);
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
  async findOne(@ZodParam('id') id: string) {
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
  async remove(@ZodParam('id') id: string) {
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
    @ZodParam('id') id: string,
    @ZodBody() updateDepartmentDto: typeof UpdateDepartmentSchema.Type,
  ) {
    return this.departmentService.update(id, updateDepartmentDto);
  }
}
