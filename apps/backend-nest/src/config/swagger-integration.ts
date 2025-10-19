import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { openAPIConfig } from './openapi.config';

/**
 * Swagger 集成配置
 *
 * 将 NestJS 的 Swagger 装饰器与我们的 zod-to-openapi 配置集成
 * 确保所有使用标准 Swagger 装饰器的路由都能在文档中显示
 */
export class SwaggerIntegration {
  /**
   * 设置 Swagger 文档
   *
   * @param app NestJS 应用实例
   */
  static setupSwagger(app: INestApplication) {
    // 获取配置服务和全局前缀
    const configService = app.get(ConfigService);
    const globalPrefix = configService.get<string>('app.apiPrefix') || 'api';

    // 创建标准的 Swagger 文档配置
    const config = new DocumentBuilder()
      .setTitle('Vben Backend API')
      .setDescription(
        '基于 NestJS + Zod 构建的现代化后端 API 服务\n\n## 架构特点\n- 使用 Zod 进行数据验证和类型定义\n- 统一的三段式返回格式 (code, message, data)\n- 自动生成的 OpenAPI 文档\n- 类型安全的 API 接口',
      )
      .setVersion('1.0.0')
      .setContact('API Support', '', 'support@example.com')
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addServer(`http://localhost:3333`, '本地开发环境')
      .addServer(`https://api.example.com`, '生产环境')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT 认证令牌，格式：Bearer <token>',
        },
        'bearerAuth',
      )
      .addTag('认证管理', '用户认证相关接口，包括登录、注册、令牌刷新等')
      .addTag('用户管理', '用户信息管理接口，包括用户信息查询、更新、删除等')
      .addTag('系统管理', '系统基础接口，包括健康检查、系统信息等')
      .build();

    // 生成标准的 Swagger 文档
    const nestDocument = SwaggerModule.createDocument(app, config);

    // 获取我们的 zod-to-openapi 文档
    const zodDocument = openAPIConfig.generateDocument();

    // 合并两个文档
    const mergedDocument = this.mergeDocuments(nestDocument, zodDocument);

    // 设置 Swagger UI
    SwaggerModule.setup('docs', app, mergedDocument, {
      swaggerOptions: {
        persistAuthorization: true, // 保持认证状态
        tagsSorter: 'alpha', // 按字母顺序排序标签
        operationsSorter: 'alpha', // 按字母顺序排序操作
        docExpansion: 'none', // 默认折叠所有操作
        filter: true, // 启用搜索过滤
        showRequestDuration: true, // 显示请求耗时
      },
      customSiteTitle: 'Vben Backend API 文档',
      customfavIcon: '/favicon.ico',
      customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { color: #1890ff; }
      `,
    });

    return mergedDocument;
  }

  /**
   * 合并 NestJS Swagger 文档和 zod-to-openapi 文档
   *
   * @param nestDocument NestJS 生成的文档
   * @param zodDocument zod-to-openapi 生成的文档
   * @returns 合并后的文档
   */
  private static mergeDocuments(nestDocument: any, zodDocument: any) {
    // 以 NestJS 文档为基础
    const mergedDocument = { ...nestDocument };

    // 合并路径
    if (zodDocument.paths) {
      mergedDocument.paths = {
        ...mergedDocument.paths,
        ...zodDocument.paths,
      };
    }

    // 合并组件（schemas, securitySchemes 等）
    if (zodDocument.components) {
      mergedDocument.components = {
        ...mergedDocument.components,
        ...zodDocument.components,
        schemas: {
          ...mergedDocument.components?.schemas,
          ...zodDocument.components.schemas,
        },
      };
    }

    // 确保 securitySchemes 存在
    if (!mergedDocument.components) {
      mergedDocument.components = {};
    }
    if (!mergedDocument.components.securitySchemes) {
      mergedDocument.components.securitySchemes = {};
    }

    // 添加 JWT 认证配置
    mergedDocument.components.securitySchemes.bearerAuth = {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT 认证令牌，格式：Bearer <token>',
    };

    return mergedDocument;
  }
}
