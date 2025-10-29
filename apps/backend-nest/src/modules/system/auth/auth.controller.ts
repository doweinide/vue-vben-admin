import { Public } from '@/common';
import { ApiGet, ApiPost } from '@/decorators/api.decorator';
import { ZodBody } from '@/decorators/zod-param.decorator';
import {
  AuthUserSchema,
  createResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
} from '@/schemas';
import { Controller, Request } from '@nestjs/common';

import { AuthService } from './auth.service';

// 用户资料响应 Schema
const ProfileResponseSchema = createResponseSchema(
  AuthUserSchema,
  'ProfileResponse',
  '用户资料响应',
);

type ProfileResponse = typeof ProfileResponseSchema.Type;

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
