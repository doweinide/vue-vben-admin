import { Body, Controller, Get, Post, Request } from '@nestjs/common';

import { Public } from '../../common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';

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
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
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
  @Post('login')
  @Public()
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
