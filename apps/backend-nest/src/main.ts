import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

/**
 * 应用程序启动函数
 *
 * 负责创建和配置 NestJS 应用实例
 * 包括全局管道、CORS、Swagger 文档等配置
 *
 * 主要功能：
 * - 创建 NestJS 应用实例
 * - 配置全局验证管道
 * - 设置 API 路由前缀
 * - 启用 CORS 跨域支持
 * - 配置 Swagger API 文档
 * - 启动 HTTP 服务器
 */
async function bootstrap() {
  try {
    console.log('[Bootstrap] Starting application...');

    // 创建 NestJS 应用实例
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    console.log('[Bootstrap] Application created successfully');

    // 注册全局 Zod 验证管道
    // 由于 ZodValidationPipe 是请求作用域的，不能直接实例化
    // 需要通过模块注册

    // 设置全局 API 路由前缀
    // 所有路由都会添加此前缀，例如：/api/users
    const apiPrefix = configService.get<string>('app.apiPrefix') || 'api';
    app.setGlobalPrefix(apiPrefix);

    console.log(`[Bootstrap] API prefix set to: ${apiPrefix}`);

    // CORS 跨域配置
    // 允许前端应用跨域访问 API
    const corsOrigin = configService.get<string>('app.corsOrigin') || '*';
    app.enableCors({
      origin: corsOrigin, // 允许的源地址
      credentials: true, // 允许携带认证信息
    });

    console.log(`[Bootstrap] CORS enabled for origin: ${corsOrigin}`);

    // 启动 HTTP 服务器
    const port = configService.get<number>('app.port') || 3333;

    console.log('[Bootstrap] Setting up Swagger documentation...');

    // 使用集成的 Swagger 配置
    const { SwaggerIntegration } = await import(
      './config/swagger-integration.js'
    );
    SwaggerIntegration.setupSwagger(app); // 文档访问路径：/docs

    console.log('[Bootstrap] Swagger documentation setup completed');

    console.log(`[Bootstrap] Starting server on port ${port}...`);

    await app.listen(port);
    console.log(`🚀 应用程序运行在: http://localhost:${port}/${apiPrefix}`);
    console.log(`📚 API 文档地址: http://localhost:${port}/docs`);
    console.log('[Bootstrap] Application started successfully');
  } catch (error) {
    console.error('[Bootstrap] Failed to start application:', {
      error: error instanceof Error ? error.message : String(error),
      errorType: error?.constructor?.name,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // 如果是 UnknownZodTypeError，提供更详细的错误信息
    if (
      error?.constructor?.name === 'UnknownZodTypeError' ||
      error?.message?.includes('UnknownZodTypeError')
    ) {
      console.error(
        '[Bootstrap] UnknownZodTypeError detected during startup. This usually indicates:',
      );
      console.error('  1. Circular references in Zod schemas');
      console.error('  2. Invalid schema definitions');
      console.error('  3. Missing or incorrect type imports');
      console.error('  Please check all schema files in src/schemas/');
    }

    process.exit(1);
  }
}

// 添加全局未处理的 Promise 拒绝处理器
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Global] Unhandled Promise Rejection:', {
    reason: reason instanceof Error ? reason.message : String(reason),
    reasonType: reason?.constructor?.name,
    stack: reason instanceof Error ? reason.stack : undefined,
    promise,
  });

  if (
    reason?.constructor?.name === 'UnknownZodTypeError' ||
    (typeof reason === 'string' && reason.includes('UnknownZodTypeError'))
  ) {
    console.error(
      '[Global] UnknownZodTypeError in unhandled rejection. Exiting...',
    );
    process.exit(1);
  }
});

// 添加全局未捕获异常处理器
process.on('uncaughtException', (error) => {
  console.error('[Global] Uncaught Exception:', {
    error: error.message,
    errorType: error.constructor.name,
    stack: error.stack,
  });

  if (error.constructor.name === 'UnknownZodTypeError') {
    console.error(
      '[Global] UnknownZodTypeError in uncaught exception. Exiting...',
    );
  }

  process.exit(1);
});

bootstrap();
