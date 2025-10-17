import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Public } from '../../common';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto, ProfileResponseDto } from './dto';

/**
 * 认证控制器
 *
 * 处理用户认证相关的 HTTP 请求
 * 包括用户登录、获取用户信息等功能
 *
 * 路由前缀: /auth
 */
@ApiTags('认证管理')
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取当前用户信息',
    description: '获取当前登录用户的详细信息，需要提供有效的 JWT token',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取用户信息',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '未授权，token 无效或已过期',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @Get('profile')
  getProfile(@Request() req): ProfileResponseDto {
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
  @ApiBody({
    type: LoginDto,
    description: '登录凭据',
  })
  @ApiOperation({
    summary: '用户登录',
    description: '验证用户凭据并返回访问令牌，用于后续 API 调用的身份验证',
  })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    type: LoginResponseDto,
  })
  @Post('login')
  @Public()
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
