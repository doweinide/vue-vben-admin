import { Public } from '@/common';
import { ApiGet, ApiPost } from '@/decorators/api.decorator';
import { ZodBody } from '@/decorators/zod-param.decorator';
import {
  AuthUserSchema,
  createResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
} from '@/schemas';
import { zPro as z } from '@/utils/zod/z-enhanced';
import { Controller, Request, UseGuards } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';

// 用户资料响应 Schema
const ProfileResponseSchema = createResponseSchema(
  AuthUserSchema,
  'ProfileResponse',
  '用户资料响应',
);

const UserMenusResponseSchema = createResponseSchema(
  z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      path: z.string().optional().nullable(),
      component: z.string().optional().nullable(),
      type: z.string(),
      authCode: z.string().optional().nullable(),
      pid: z.string().optional().nullable(),
      status: z.number().int().min(0).max(1),
      meta: z.any().optional().nullable(),
      createTime: z.date(),
      updateTime: z.date(),
      children: z.array(z.any()).optional(),
    }),
  ),
  'UserMenusResponse',
  '用户菜单响应',
);

type ProfileResponse = typeof ProfileResponseSchema.Type;
type UserMenusResponse = typeof UserMenusResponseSchema.Type;

/**
 * 认证控制器
 *
 * 处理用户认证相关的 HTTP 请求
 * 包括用户登录、获取用户信息等功能
 *
 * 路由前缀: /auth
 */
@Controller('auth')
export class AuthController {
  /**
   * 构造函数
   *
   * @param authService 认证服务，处理认证业务逻辑
   */
  constructor(private readonly authService: AuthService) {}

  @ApiGet({
    path: 'menus',
    summary: '获取当前用户可访问菜单',
    description: '合并用户启用角色的有效菜单并返回树结构',
    tags: ['认证管理'],
    responseSchema: UserMenusResponseSchema,
    requireAuth: true,
  })
  @UseGuards(PassportAuthGuard('jwt'))
  async getMenus(@Request() req): Promise<UserMenusResponse> {
    const resp = await this.authService.getUserMenus(req.user.id);
    return {
      code: 200,
      message: resp.message ?? '获取用户菜单成功',
      data: (resp.data as any[]) ?? [],
    };
  }

  /**
   * 获取当前用户信息
   *
   * 需要认证的接口，从 JWT token 中获取用户信息
   *
   * @param req HTTP 请求对象，包含用户信息
   * @returns 当前登录用户的信息
   *
   * @example
   * GET /auth/profile
   * Authorization: Bearer <jwt_token>
   */
  @ApiGet({
    path: 'profile',
    summary: '获取当前用户信息',
    description: '获取当前登录用户的详细信息，需要提供有效的 JWT token',
    tags: ['认证管理'],
    responseSchema: ProfileResponseSchema,
    requireAuth: true,
  })
  @UseGuards(PassportAuthGuard('jwt'))
  getProfile(@Request() req): ProfileResponse {
    return {
      code: 200,
      message: '获取用户信息成功',
      data: req.user,
    };
  }

  /**
   * 用户登录
   *
   * 公共接口，无需认证
   * 验证用户凭据并返回 JWT token
   *
   * @param loginDto 登录数据传输对象
   * @returns 登录结果，包含 token 和用户信息
   *
   * @example
   * POST /auth/login
   * {
   *   "username": "admin",
   *   "password": "123456"
   * }
   */
  @Public()
  @ApiPost({
    path: 'login',
    summary: '用户登录',
    description: '用户通过用户名和密码进行登录认证，成功后返回 JWT token',
    tags: ['认证管理'],
    bodySchema: LoginRequestSchema,
    responseSchema: LoginResponseSchema,
    requireAuth: false,
  })
  async login(
    @ZodBody() loginDto: typeof LoginRequestSchema.Type,
  ): Promise<typeof LoginResponseSchema.Type> {
    return this.authService.login(loginDto);
  }
}
