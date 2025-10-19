import type { OpenAPIObject } from 'openapi3-ts/oas30';

import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { BaseResponseSchema, PaginationSchema } from '../schemas/base.schema';

extendZodWithOpenApi(z);

/**
 * OpenAPI 配置类
 *
 * 负责管理 zod-to-openapi 的配置和文档生成
 * 提供统一的 API 文档生成接口
 */
export class OpenAPIConfig {
  private registry = new OpenAPIRegistry();

  /**
   * 生成 OpenAPI 文档
   *
   * @returns OpenAPI 3.0 文档对象
   */
  generateDocument(): OpenAPIObject {
    const generator = new OpenApiGeneratorV3(this.registry.definitions);

    const document = generator.generateDocument({
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'Vben Backend API',
        description:
          '基于 NestJS + Zod 构建的现代化后端 API 服务\n\n## 架构特点\n- 使用 Zod 进行数据验证和类型定义\n- 统一的三段式返回格式 (code, message, data)\n- 自动生成的 OpenAPI 文档\n- 类型安全的 API 接口',
        contact: {
          name: 'API Support',
          email: 'support@example.com',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: 'http://localhost:3333',
          description: '本地开发环境',
        },
        {
          url: 'https://api.example.com',
          description: '生产环境',
        },
      ],
      security: [
        {
          bearerAuth: [],
        },
      ],
      tags: [
        {
          name: '认证管理',
          description: '用户认证相关接口，包括登录、注册、令牌刷新等',
        },
        {
          name: '用户管理',
          description: '用户信息管理接口，包括用户信息查询、更新、删除等',
        },
        {
          name: '系统管理',
          description: '系统基础接口，包括健康检查、系统信息等',
        },
      ],
    });

    // 手动添加 securitySchemes，因为 generateDocument 会覆盖 components
    if (!document.components) {
      document.components = {};
    }

    document.components.securitySchemes = {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT 认证令牌，格式：Bearer <token>',
      },
    };

    return document;
  }

  /**
   * 获取注册表实例
   *
   * @returns OpenAPIRegistry 实例
   */
  getRegistry() {
    return this.registry;
  }

  /**
   * 注册 API 路径
   *
   * @param path 路径配置
   */
  registerPath(path: any) {
    // 处理控制器路径前缀
    if (path.path && path.path.includes('{controller}')) {
      // 从调用栈中获取控制器信息
      const controllerPath = this.getControllerPath();
      path.path = path.path.replace('{controller}', controllerPath);
    }

    this.registry.registerPath(path);
  }

  /**
   * 注册 Schema
   *
   * @param name Schema 名称
   * @param schema Zod Schema
   */
  registerSchema(name: string, schema: z.ZodType) {
    this.registry.register(name, schema);
  }

  /**
   * 获取控制器路径
   * 通过分析调用栈来确定当前控制器的路径
   * 注意：返回带有 /api 前缀的完整路径，因为 Swagger 需要显示完整的 API 路径
   */
  private getControllerPath(): string {
    // 获取调用栈
    const stack = new Error('Getting controller path from stack trace').stack;
    if (!stack) return '';

    // 分析调用栈，查找控制器文件
    const lines = stack.split('\n');
    for (const line of lines) {
      if (line.includes('.controller.')) {
        // 提取控制器名称
        const match = line.match(/(\w+)\.controller\./);
        if (match) {
          const controllerName = match[1];
          // 根据控制器名称返回对应的路径，包含/api前缀
          switch (controllerName.toLowerCase()) {
            case 'app': {
              return '/api';
            } // app controller 返回/api路径
            case 'auth': {
              return '/api/auth';
            }
            case 'user': {
              return '/api/users';
            }
            default: {
              return `/api/${controllerName.toLowerCase()}`;
            }
          }
        }
      }
    }

    return '';
  }

  /**
   * 注册基础 Schema
   */
  private setupBaseSchemas() {
    // 注册基础响应 Schema
    this.registry.register('BaseResponse', BaseResponseSchema);

    // 注册分页查询 Schema
    this.registry.register('PaginationQuery', PaginationSchema);
  }
}

// 导出全局配置实例
export const openAPIConfig = new OpenAPIConfig();
