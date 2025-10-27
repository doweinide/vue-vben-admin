import { applyDecorators, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { z } from 'zod';

import { openAPIConfig } from '../config/openapi.config';

import 'reflect-metadata';

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
 * 在装饰器阶段只收集配置信息，路径拼接延迟到文档生成阶段
 */
export function ApiEndpoint(options: ApiEndpointOptions) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
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

    // 如果有任何 schema，直接设置到方法上
    if (Object.keys(schemas).length > 0) {
      Reflect.defineMetadata('api:zodSchemas', schemas, descriptor.value);
    }

    // 将 Express 风格的路径参数 :param 转换为 OpenAPI 风格的 {param}
    const convertedPath = options.path.replaceAll(/:(\w+)/g, '{$1}');

    // 存储原始的 API 配置信息到元数据，不进行路径拼接
    // 路径拼接将在文档生成阶段通过反射获取控制器信息后统一处理
    const apiConfig: any = {
      method: options.method,
      path: convertedPath, // 存储转换后的相对路径，不包含控制器前缀
      summary: options.summary,
      description: options.description,
      tags: options.tags || [],
    };

    // 添加请求配置
    if (options.bodySchema) {
      apiConfig.request = {
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
      apiConfig.request = {
        ...apiConfig.request,
        query: options.querySchema,
      };
    }

    if (options.paramSchema) {
      apiConfig.request = {
        ...apiConfig.request,
        params: options.paramSchema,
      };
    }

    // 添加响应配置
    apiConfig.responses = {
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
      apiConfig.security = [{ bearerAuth: [] }];

      // 添加 401 响应
      apiConfig.responses[401] = {
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

    // 将 API 配置存储到方法的元数据中，供后续收集器使用
    Reflect.defineMetadata('api:config', apiConfig, descriptor.value);

    // 同时收集到 OpenAPI 配置中，确保 schema 信息被正确注册
    // 注意：这里需要传递完整的路径信息，包括控制器前缀
    // 但在装饰器阶段我们无法获取控制器信息，所以先存储相对路径
    // 在应用启动后通过反射获取完整路径信息
    openAPIConfig.collectPath({
      ...apiConfig,
      // 添加一个标记，表示这是相对路径，需要后续处理
      isRelativePath: true,
    });
  };
}

/**
 * 快捷装饰器 - GET 请求
 */
export function ApiGet(options: Omit<ApiEndpointOptions, 'method'>) {
  return applyDecorators(
    Get(options.path),
    ApiEndpoint({ ...options, method: 'get' }),
  );
}

/**
 * 快捷装饰器 - POST 请求
 */
export function ApiPost(options: Omit<ApiEndpointOptions, 'method'>) {
  return applyDecorators(
    Post(options.path),
    ApiEndpoint({ ...options, method: 'post' }),
  );
}

/**
 * 快捷装饰器 - PUT 请求
 */
export function ApiPut(options: Omit<ApiEndpointOptions, 'method'>) {
  return applyDecorators(
    Put(options.path),
    ApiEndpoint({ ...options, method: 'put' }),
  );
}

/**
 * 快捷装饰器 - DELETE 请求
 */
export function ApiDelete(options: Omit<ApiEndpointOptions, 'method'>) {
  return applyDecorators(
    Delete(options.path),
    ApiEndpoint({ ...options, method: 'delete' }),
  );
}

/**
 * 快捷装饰器 - PATCH 请求
 */
export function ApiPatch(options: Omit<ApiEndpointOptions, 'method'>) {
  return applyDecorators(
    Patch(options.path),
    ApiEndpoint({ ...options, method: 'patch' }),
  );
}
