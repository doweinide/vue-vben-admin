import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { z } from 'zod';

import { ApiGet, ApiPost } from './decorators/api.decorator';

// 测试用的 Zod Schema
const CreateTestSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  email: z.string().email('邮箱格式不正确'),
  age: z.number().min(18, '年龄必须大于等于18'),
});

const UpdateTestSchema = z.object({
  name: z.string().min(1, '名称不能为空').optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  age: z.number().min(18, '年龄必须大于等于18').optional(),
});

const IdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID必须是数字'),
});

const QueryTestSchema = z.object({
  page: z.string().regex(/^\d+$/, '页码必须是数字').optional(),
  limit: z.string().regex(/^\d+$/, '每页数量必须是数字').optional(),
});

/**
 * 测试验证控制器
 * 用于测试全局 ZodValidationPipe 的自动验证功能
 */
@Controller('test-validation')
export class TestValidationController {
  /**
   * 测试 Body 验证
   */
  @Post()
  @ApiPost({
    path: '/',
    summary: '测试创建',
    description: '测试 Body 参数的自动验证',
    tags: ['测试'],
    bodySchema: CreateTestSchema,
  })
  create(@Body() createDto: z.infer<typeof CreateTestSchema>) {
    return {
      code: 200,
      message: '创建成功',
      data: createDto,
    };
  }

  /**
   * 测试 Query 验证
   */
  @Get()
  @ApiGet({
    path: '/',
    summary: '测试获取列表',
    description: '测试 Query 参数的自动验证',
    tags: ['测试'],
    querySchema: QueryTestSchema,
  })
  findAll(@Query() query: z.infer<typeof QueryTestSchema>) {
    return {
      code: 200,
      message: '获取成功',
      data: { query },
    };
  }

  /**
   * 测试 Param 验证
   */
  @Get(':id')
  @ApiGet({
    path: '/:id',
    summary: '测试获取详情',
    description: '测试 Param 参数的自动验证',
    tags: ['测试'],
    paramSchema: IdParamSchema,
  })
  findOne(@Param('id') id: string) {
    return {
      code: 200,
      message: '获取成功',
      data: { id },
    };
  }

  /**
   * 测试更新 - 组合验证
   */
  @Post(':id')
  @ApiPost({
    path: '/:id',
    summary: '测试更新',
    description: '测试 Body + Param 参数的自动验证',
    tags: ['测试'],
    bodySchema: UpdateTestSchema,
    paramSchema: IdParamSchema,
  })
  update(
    @Param('id') id: string,
    @Body() updateDto: z.infer<typeof UpdateTestSchema>,
  ) {
    return {
      code: 200,
      message: '更新成功',
      data: { id, ...updateDto },
    };
  }
}
