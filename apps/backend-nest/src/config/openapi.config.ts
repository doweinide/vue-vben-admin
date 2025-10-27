import type { OpenAPIObject } from 'openapi3-ts/oas30';

import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { BaseResponseSchema, PaginationSchema } from '../schemas/base.schema';
import { PathCollector } from './path-collector';

extendZodWithOpenApi(z);

/**
 * OpenAPI 配置类
 *
 * 负责管理 zod-to-openapi 的配置和文档生成
 * 提供统一的 API 文档生成接口
 */
export class OpenAPIConfig {
  private pathCollector?: PathCollector;
  private pendingPaths: any[] = []; // 存储待处理的路径配置
  private registry = new OpenAPIRegistry();

  /**
   * 清空待处理的路径配置
   */
  clearPendingPaths() {
    this.pendingPaths = [];
  }

  /**
   * 收集 API 路径配置
   * 在装饰器阶段只收集配置，不进行路径处理
   *
   * @param pathConfig 路径配置
   */
  collectPath(pathConfig: any) {
    console.log('收集路径配置:', {
      method: pathConfig.method,
      path: pathConfig.path,
      tags: pathConfig.tags,
      summary: pathConfig.summary,
    });
    this.pendingPaths.push(pathConfig);
  }

  /**
   * 生成 OpenAPI 文档
   *
   * @returns OpenAPI 3.0 文档对象
   */
  generateDocument(): OpenAPIObject {
    // 设置基础 schemas
    this.setupBaseSchemas();

    // 使用 PathCollector 收集完整的路径配置
    if (this.pathCollector) {
      const allPaths = this.pathCollector.collectAllPaths();
      console.log('PathCollector 收集到的路径数量:', allPaths.length);

      // 注册所有路径
      for (const pathConfig of allPaths) {
        console.log('注册完整路径:', {
          method: pathConfig.method,
          path: pathConfig.path,
          tags: pathConfig.tags,
          operationId: pathConfig.operationId,
        });
        this.registry.registerPath(pathConfig);
      }
    } else {
      // 回退到原有的处理方式
      this.processPendingPaths();
    }

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
          name: '菜单管理',
          description: '系统菜单管理接口，包括菜单的增删改查、权限配置等',
        },
        {
          name: '角色管理',
          description: '用户角色管理接口，包括角色的增删改查、权限分配等',
        },
        {
          name: '部门管理',
          description: '组织部门管理接口，包括部门的增删改查、层级管理等',
        },
        {
          name: '系统管理',
          description: '系统基础接口，包括健康检查、系统信息等',
        },
        {
          name: '测试',
          description: '测试相关接口，用于验证系统功能和性能',
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

    console.log(
      '生成的文档路径数量:',
      Object.keys(document.paths || {}).length,
    );
    console.log('生成的文档路径:', Object.keys(document.paths || {}));

    return document;
  }

  /**
   * 获取待处理的路径配置
   *
   * @returns 待处理的路径配置数组
   */
  getPendingPaths() {
    return this.pendingPaths;
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
   * 处理待处理的路径配置
   * 将收集到的路径配置注册到 OpenAPI 注册表
   */
  processPendingPaths() {
    console.log('开始处理路径配置，总数:', this.pendingPaths.length);
    for (const pathConfig of this.pendingPaths) {
      console.log('注册路径:', {
        method: pathConfig.method,
        path: pathConfig.path,
        tags: pathConfig.tags,
      });
      // 直接注册路径配置，让 zod-to-openapi 自动处理 schema
      this.registry.registerPath(pathConfig);
    }

    // 清空已处理的配置
    this.clearPendingPaths();
    console.log('路径配置处理完成');
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
   * 设置路径收集器
   */
  setPathCollector(pathCollector: PathCollector) {
    this.pathCollector = pathCollector;
  }

  /**
   * 注册基础 Schema
   */
  setupBaseSchemas() {
    // 注册基础响应 Schema
    this.registry.register('BaseResponse', BaseResponseSchema);

    // 注册分页查询 Schema
    this.registry.register('PaginationQuery', PaginationSchema);
  }
}

// 导出全局配置实例
export const openAPIConfig = new OpenAPIConfig();
