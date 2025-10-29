import {
  ApiDelete,
  ApiGet,
  ApiPatch,
  ApiPost,
} from '@/decorators/api.decorator';
import { ZodBody, ZodParam, ZodQuery } from '@/decorators/zod-param.decorator';
import {
  CreateMenuSchema,
  IdParamSchema,
  MenuNameExistsSchema,
  MenuPathExistsSchema,
  MenuQuerySchema,
  MenuResponseSchema,
  UpdateMenuSchema,
} from '@/schemas';
import { Controller, HttpCode, HttpStatus } from '@nestjs/common';

import { MenuService } from './menu.service';

@Controller('system/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiPost({
    path: '',
    summary: '创建菜单',
    description: '创建新的菜单项',
    tags: ['菜单管理'],
    bodySchema: CreateMenuSchema,
    responseSchema: MenuResponseSchema,
  })
  async create(@ZodBody() createMenuDto: typeof CreateMenuSchema.Type) {
    return this.menuService.create(createMenuDto);
  }

  @ApiGet({
    path: 'list',
    summary: '获取菜单列表',
    description: '获取菜单列表，支持筛选条件',
    tags: ['菜单管理'],
    querySchema: MenuQuerySchema,
    responseSchema: MenuResponseSchema,
  })
  async findAll(@ZodQuery() query: typeof MenuQuerySchema.Type) {
    return this.menuService.findAll(query);
  }

  @ApiGet({
    path: ':id',
    summary: '获取菜单详情',
    description: '根据ID获取菜单详情',
    tags: ['菜单管理'],
    paramSchema: IdParamSchema,
    responseSchema: MenuResponseSchema,
  })
  async findOne(@ZodParam('id') id: string) {
    return this.menuService.findOne(id);
  }

  @ApiGet({
    path: 'name-exists',
    summary: '检查菜单名称是否存在',
    description: '检查菜单名称是否已存在',
    tags: ['菜单管理'],
    querySchema: MenuNameExistsSchema,
  })
  async isNameExists(@ZodQuery() params: typeof MenuNameExistsSchema.Type) {
    const exists = await this.menuService.isNameExists(params);
    return { exists };
  }

  @ApiGet({
    path: 'path-exists',
    summary: '检查菜单路径是否存在',
    description: '检查菜单路径是否已存在',
    tags: ['菜单管理'],
    querySchema: MenuPathExistsSchema,
  })
  async isPathExists(@ZodQuery() params: typeof MenuPathExistsSchema.Type) {
    const exists = await this.menuService.isPathExists(params);
    return { exists };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDelete({
    path: ':id',
    summary: '删除菜单',
    description: '删除指定ID的菜单',
    tags: ['菜单管理'],
    paramSchema: IdParamSchema,
  })
  async remove(@ZodParam('id') id: string) {
    await this.menuService.remove(id);
  }

  @ApiPatch({
    path: ':id',
    summary: '更新菜单',
    description: '根据ID更新菜单信息',
    tags: ['菜单管理'],
    paramSchema: IdParamSchema,
    bodySchema: UpdateMenuSchema,
    responseSchema: MenuResponseSchema,
  })
  async update(
    @ZodParam('id') id: string,
    @ZodBody() updateMenuDto: typeof UpdateMenuSchema.Type,
  ) {
    return this.menuService.update(id, updateMenuDto);
  }
}
