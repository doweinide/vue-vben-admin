import { applyDecorators, SetMetadata } from '@nestjs/common';
import { z } from 'zod';

import { openAPIConfig } from '../config/openapi.config';

/**
 * API 端点装饰器选项
 */
export interface ApiEndpointOptions {
  /** HTTP 方法 */
  method: 'delete' | 'get' | 'patch' | 'post' | 'put';
  /** API 路径 */
  path: string;
  /** 接口摘要 */
  summary: string;
  /** 接口描述 */
  description?: string;
  /** 标签 */
  tags?: string[];
  /** 请求体 Schema */
  bodySchema?: z.ZodSchema;
  /** 查询参数 Schema */
  querySchema?: z.ZodSchema;
  /** 路径参数 Schema */
  paramSchema?: z.ZodSchema;
  /** 响应 Schema */
  responseSchema?: z.ZodSchema;
  /** 是否需要认证 */
  requireAuth?: boolean;
}

/**
 * API 端点装饰器
 *
 * 统一的 API 装饰器，集成了验证、文档生成等功能
 * 自动处理路径前缀和 OpenAPI 文档注册
 */
export function ApiEndpoint(options: ApiEndpointOptions) {
  const decorators: any[] = [];

  // 存储 schema 信息到元数据，供拦截器使用
  const schemas: any = {};
  if (options.bodySchema) {
    schemas.bodySchema = options.bodySchema;
  }
  if (options.paramSchema) {
    schemas.paramSchema = options.paramSchema;
  }
  if (options.querySchema) {
    schemas.querySchema = options.querySchema;
  }

  // 如果有任何 schema，添加元数据
  if (Object.keys(schemas).length > 0) {
    decorators.push(SetMetadata('api:zodSchemas', schemas));
  }

  // 构建完整的 OpenAPI 路径
  // 注意：这里我们需要在运行时获取控制器路径，但装饰器在编译时执行
  // 所以我们使用一个特殊的格式来标记需要后续处理的路径
  // 同时将 Express 风格的路径参数 :param 转换为 OpenAPI 风格的 {param}
  const convertedPath = options.path.replaceAll(/:(\w+)/g, '{$1}');
  const fullPath = `{controller}${convertedPath}`;

  // 注册 OpenAPI 路径
  const pathConfig: any = {
    method: options.method,
    path: fullPath, // 使用标记格式，后续会被替换
    summary: options.summary,
    description: options.description,
    tags: options.tags || [],
  };

  // 添加请求配置
  if (options.bodySchema) {
    pathConfig.request = {
      body: {
        content: {
          'application/json': {
            schema: options.bodySchema,
          },
        },
      },
    };
  }

  if (options.querySchema) {
    pathConfig.request = {
      ...pathConfig.request,
      query: options.querySchema,
    };
  }

  if (options.paramSchema) {
    pathConfig.request = {
      ...pathConfig.request,
      params: options.paramSchema,
    };
  }

  // 添加响应配置
  pathConfig.responses = {
    200: {
      description: '成功',
      content: {
        'application/json': {
          schema: options.responseSchema || {
            type: 'object',
            properties: {
              code: { type: 'number', example: 200 },
              message: { type: 'string', example: '操作成功' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    400: {
      description: '请求参数错误',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              code: { type: 'number', example: 400 },
              message: { type: 'string', example: '请求参数验证失败' },
              data: {
                type: 'object',
                properties: {
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string' },
                        message: { type: 'string' },
                        code: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  // 添加认证要求
  if (options.requireAuth) {
    pathConfig.security = [{ bearerAuth: [] }];

    // 添加 401 响应
    pathConfig.responses[401] = {
      description: '未授权',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              code: { type: 'number', example: 401 },
              message: { type: 'string', example: '未授权访问' },
            },
          },
        },
      },
    };
  }

  // 注册到 OpenAPI 配置
  openAPIConfig.registerPath(pathConfig);

  return applyDecorators(...decorators);
}

/**
 * 快捷装饰器 - GET 请求
 */
export function ApiGet(options: Omit<ApiEndpointOptions, 'method'>) {
  return ApiEndpoint({ ...options, method: 'get' });
}

/**
 * 快捷装饰器 - POST 请求
 */
export function ApiPost(options: Omit<ApiEndpointOptions, 'method'>) {
  return ApiEndpoint({ ...options, method: 'post' });
}

/**
 * 快捷装饰器 - PUT 请求
 */
export function ApiPut(options: Omit<ApiEndpointOptions, 'method'>) {
  return ApiEndpoint({ ...options, method: 'put' });
}

/**
 * 快捷装饰器 - DELETE 请求
 */
export function ApiDelete(options: Omit<ApiEndpointOptions, 'method'>) {
  return ApiEndpoint({ ...options, method: 'delete' });
}

/**
 * 快捷装饰器 - PATCH 请求
 */
export function ApiPatch(options: Omit<ApiEndpointOptions, 'method'>) {
  return ApiEndpoint({ ...options, method: 'patch' });
}
