import { Injectable } from '@nestjs/common';

/**
 * 应用程序根服务
 *
 * 提供应用程序的基础服务功能
 * 包含通用的业务逻辑和工具方法
 *
 * 主要用于根控制器的业务逻辑处理
 */
@Injectable()
export class AppService {
  /**
   * 获取欢迎信息
   *
   * 返回应用程序的欢迎信息
   * 通常用于测试应用程序是否正常运行
   *
   * @returns 欢迎信息字符串
   */
  getHello(): string {
    return 'Hello World!';
  }
}
