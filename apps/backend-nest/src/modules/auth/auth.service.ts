import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { LoginRequestSchema } from '../../schemas';
import { UserService } from '../user/user.service';

/**
 * 认证服务
 *
 * 处理用户认证相关的业务逻辑
 * 包括用户登录验证、JWT token 生成、用户验证等功能
 */
@Injectable()
export class AuthService {
  /**
   * 构造函数
   *
   * @param userService 用户服务，用于查询用户信息
   * @param jwtService JWT 服务，用于生成和验证 token
   */
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * 用户登录
   *
   * 验证用户凭据并生成 JWT token
   *
   * @param loginDto 登录数据传输对象
   * @returns 登录结果，包含 access_token 和用户信息
   * @throws UnauthorizedException 当用户名密码错误或用户被禁用时抛出
   */
  async login(loginDto: typeof LoginRequestSchema.Type) {
    // 根据用户名查找用户
    const user = await this.userService.findByUsername(loginDto.username);

    // 验证用户是否存在且密码正确
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查用户账户状态
    if (user.status !== 1) {
      throw new UnauthorizedException('用户已被禁用');
    }

    // 构造 JWT payload
    const payload = {
      sub: user.id, // 用户 ID（标准 JWT 字段）
      username: user.username,
      userRoles: user.userRoles, // 用户角色信息
    };

    // 返回登录结果
    return {
      code: 200,
      message: '登录成功',
      data: {
        // 生成 JWT access token
        access_token: this.jwtService.sign(payload),
        // 返回用户基本信息（不包含密码）
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          deptId: user.deptId,
          status: user.status,
          userRoles: user.userRoles,
          createTime: user.createdAt,
          updateTime: user.updatedAt,
        },
      },
    };
  }

  /**
   * 验证用户
   *
   * 根据用户 ID 验证用户是否存在且有效
   * 通常在 JWT 策略中使用
   *
   * @param userId 用户 ID
   * @returns 用户信息或 null
   */
  async validateUser(userId: string) {
    return this.userService.findOne(userId);
  }
}
