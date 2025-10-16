import { SetMetadata } from '@nestjs/common';

/**
 * 公共路由元数据键
 *
 * 用于标识路由是否为公共路由（无需认证）
 * 在认证守卫中会检查此元数据来决定是否跳过认证
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 公共路由装饰器
 *
 * 用于标记不需要认证的路由端点
 * 使用此装饰器的路由将跳过 JWT 认证检查
 *
 * @returns SetMetadata 装饰器
 *
 * @example
 * ```typescript
 * @Controller('auth')
 * export class AuthController {
 *   @Public()
 *   @Post('login')
 *   async login(@Body() loginDto: LoginDto) {
 *     // 登录接口无需认证
 *     return this.authService.login(loginDto);
 *   }
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
