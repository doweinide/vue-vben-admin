/**
 * 测试自动验证机制的示例控制器
 *
 * 这个文件用于演示新的自动验证机制如何工作
 * 开发者只需要在装饰器中定义 schema，无需手动添加参数装饰器
 */

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { z } from 'zod';

import { ApiGet, ApiPatch, ApiPost } from './decorators/api.decorator';

// 定义测试用的 Schema
const CreateTestSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  email: z.string().email('邮箱格式不正确'),
  age: z.number().min(0, '年龄不能小于0').max(120, '年龄不能大于120'),
});

const UpdateTestSchema = z.object({
  name: z.string().min(1, '名称不能为空').optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  age: z
    .number()
    .min(0, '年龄不能小于0')
    .max(120, '年龄不能大于120')
    .optional(),
});

const IdParamSchema = z.object({
  id: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().positive('ID必须是正整数')),
});

const QueryTestSchema = z.object({
  page: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().positive('页码必须是正整数'))
    .optional(),
  limit: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().positive('每页数量必须是正整数'))
    .optional(),
  search: z.string().optional(),
});

// 类型定义
type CreateTestRequest = z.infer<typeof CreateTestSchema>;
type UpdateTestRequest = z.infer<typeof UpdateTestSchema>;
type QueryTestRequest = z.infer<typeof QueryTestSchema>;

@Controller('test-validation')
export class TestValidationController {
  /**
   * 测试 POST 请求的 body 验证
   *
   * 使用新的自动验证机制：
   * - 只需在 @ApiPost 中定义 bodySchema
   * - 不需要 @ZodBody() 参数装饰器
   * - 拦截器会自动验证请求体
   */
  @Post()
  @ApiPost({
    path: '/',
    summary: '创建测试数据',
    description: '测试自动验证机制 - 请求体验证',
    tags: ['测试'],
    bodySchema: CreateTestSchema,
  })
  create(@Body() data: CreateTestRequest) {
    return {
      code: 200,
      message: '创建成功',
      data: {
        id: 1,
        ...data,
        createdAt: new Date().toISOString(),
      },
    };
  }

  /**
   * 测试 GET 请求的查询参数验证
   *
   * 使用新的自动验证机制：
   * - 只需在 @ApiGet 中定义 querySchema
   * - 不需要 @ZodQuery() 参数装饰器
   * - 拦截器会自动验证查询参数
   */
  @Get()
  @ApiGet({
    path: '/',
    summary: '获取测试数据列表',
    description: '测试自动验证机制 - 查询参数验证',
    tags: ['测试'],
    querySchema: QueryTestSchema,
  })
  findAll(@Query() query: QueryTestRequest) {
    return {
      code: 200,
      message: '查询成功',
      data: {
        items: [
          { id: 1, name: '测试1', email: 'test1@example.com', age: 25 },
          { id: 2, name: '测试2', email: 'test2@example.com', age: 30 },
        ],
        pagination: {
          page: query.page || 1,
          limit: query.limit || 10,
          total: 2,
        },
        search: query.search,
      },
    };
  }

  /**
   * 测试 GET 请求的路径参数验证
   *
   * 使用新的自动验证机制：
   * - 只需在 @ApiGet 中定义 paramSchema
   * - 不需要 @ZodParam() 参数装饰器
   * - 拦截器会自动验证路径参数
   */
  @Get(':id')
  @ApiGet({
    path: '/:id',
    summary: '获取单个测试数据',
    description: '测试自动验证机制 - 路径参数验证',
    tags: ['测试'],
    paramSchema: IdParamSchema,
  })
  findOne(@Param('id') id: number) {
    return {
      code: 200,
      message: '查询成功',
      data: {
        id,
        name: `测试${id}`,
        email: `test${id}@example.com`,
        age: 25 + id,
      },
    };
  }

  /**
   * 测试 PATCH 请求的综合验证
   *
   * 使用新的自动验证机制：
   * - 同时定义 paramSchema 和 bodySchema
   * - 不需要任何参数装饰器
   * - 拦截器会自动验证路径参数和请求体
   */
  @Patch(':id')
  @ApiPatch({
    path: '/:id',
    summary: '更新测试数据',
    description: '测试自动验证机制 - 路径参数和请求体验证',
    tags: ['测试'],
    paramSchema: IdParamSchema,
    bodySchema: UpdateTestSchema,
  })
  update(@Param('id') id: number, @Body() data: UpdateTestRequest) {
    return {
      code: 200,
      message: '更新成功',
      data: {
        id,
        ...data,
        updatedAt: new Date().toISOString(),
      },
    };
  }
}
