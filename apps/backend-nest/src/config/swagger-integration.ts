import type { INestApplication } from '@nestjs/common';

import { SwaggerModule } from '@nestjs/swagger';

import { openAPIConfig } from './openapi.config';
import { PathCollector } from './path-collector';

/**
 * Swagger 集成配置
 *
 * 负责将 OpenAPI 配置集成到 NestJS 应用中
 * 提供统一的 Swagger 文档生成和配置接口
 */
export const SwaggerIntegration = {
  /**
   * 设置 Swagger 文档
   *
   * @param app NestJS 应用实例
   * @param pathCollector 路径收集器实例
   */
  setupSwagger(app: INestApplication, pathCollector: PathCollector) {
    // 设置路径收集器到 OpenAPI 配置
    openAPIConfig.setPathCollector(pathCollector);

    // 生成 OpenAPI 文档
    const document = openAPIConfig.generateDocument();

    // 设置 Swagger UI
    SwaggerModule.setup('docs', app, document as any, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
        tryItOutEnabled: true,
        displayRequestDuration: true,
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        displayOperationId: false,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'Vben Backend API Documentation',
      customfavIcon: '/favicon.ico',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      ],
    });

    console.log('Swagger 文档设置完成');
  },
};
