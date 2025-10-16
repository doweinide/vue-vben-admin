import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../decorators';

/**
 * 认证守卫
 *
 * 用于保护需要认证的路由端点
 * 检查请求头中的 JWT token，验证用户身份
 *
 * 功能：
 * - 检查路由是否标记为公共路由（@Public 装饰器）
 * - 从请求头提取 Bearer token
 * - 验证 token 的有效性（待实现）
 * - 阻止未认证的请求访问受保护的资源
 */
@Injectable()
export class AuthGuard implements CanActivate {
  /**
   * 构造函数
   *
   * @param reflector 反射器，用于获取路由元数据
   */
  constructor(private reflector: Reflector) {}

  /**
   * 守卫激活检查
   *
   * @param context 执行上下文
   * @returns 是否允许访问
   * @throws UnauthorizedException 当认证失败时抛出
   */
  canActivate(context: ExecutionContext): boolean {
    // 检查是否为公共路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // 方法级别的元数据
      context.getClass(), // 类级别的元数据
    ]);

    // 如果是公共路由，直接允许访问
    if (isPublic) {
      return true;
    }

    // 获取 HTTP 请求对象
    const request = context.switchToHttp().getRequest();

    // 从请求头提取 token
    const token = this.extractTokenFromHeader(request);

    // 检查 token 是否存在
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    // TODO: 实现 JWT 验证逻辑
    // 这里应该验证 token 的有效性
    // 可以使用 @nestjs/jwt 包来验证 token
    // 验证成功后，可以将用户信息附加到 request 对象上

    return true;
  }

  /**
   * 从请求头提取 Bearer token
   *
   * @param request HTTP 请求对象
   * @returns 提取的 token 或 undefined
   *
   * @example
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   */
  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
