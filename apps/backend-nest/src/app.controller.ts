import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { Public } from './common';
import { ApiGet } from './decorators/api.decorator';

/**
 * 应用程序根控制器
 *
 * 提供应用程序的基础 API 接口
 * 包括健康检查和欢迎信息等通用功能
 *
 * 所有接口都是公共的，不需要认证
 */
@Controller()
export class AppController {
  /**
   * 构造函数
   *
   * @param appService 应用服务，提供基础功能
   */
  constructor(private readonly appService: AppService) {}

  /**
   * 健康检查接口
   *
   * 用于监控应用程序的运行状态
   * 返回服务状态、时间戳和运行时间
   *
   * @returns 健康检查信息
   *
   * @example
   * GET /health
   * {
   *   "status": "ok",
   *   "timestamp": "2024-01-01T00:00:00.000Z",
   *   "uptime": 3600
   * }
   */
  @Get('health')
  @Public()
  @ApiGet({
    path: '/health',
    summary: '健康检查',
    description: '检查应用程序运行状态，返回服务状态、时间戳和运行时间',
    tags: ['系统管理'],
  })
  getHealth() {
    return {
      status: 'ok', // 服务状态
      timestamp: new Date().toISOString(), // 当前时间戳
      uptime: process.uptime(), // 服务运行时间（秒）
    };
  }

  /**
   * 欢迎信息接口
   *
   * 应用程序的根路径接口
   * 返回简单的欢迎信息
   *
   * @returns 欢迎信息字符串
   *
   * @example
   * GET /
   * "Hello World!"
   */
  @Get()
  @Public()
  @ApiGet({
    path: '/',
    summary: '欢迎信息',
    description: '应用程序根路径接口，返回欢迎信息',
    tags: ['系统管理'],
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
