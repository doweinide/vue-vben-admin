import { ValidationPipe } from '@nestjs/common';
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
  // 创建 NestJS 应用实例
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 全局验证管道配置
  // 自动验证请求数据，过滤非法字段，转换数据类型
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 只保留 DTO 中定义的属性
      forbidNonWhitelisted: true, // 拒绝包含未定义属性的请求
      transform: true, // 自动转换数据类型
    }),
  );

  // 设置全局 API 路由前缀
  // 所有路由都会添加此前缀，例如：/api/users
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api';
  app.setGlobalPrefix(apiPrefix);

  // CORS 跨域配置
  // 允许前端应用跨域访问 API
  const corsOrigin = configService.get<string>('app.corsOrigin') || '*';
  app.enableCors({
    origin: corsOrigin, // 允许的源地址
    credentials: true, // 允许携带认证信息
  });

  // 启动 HTTP 服务器
  const port = configService.get<number>('app.port') || 3333;

  // 使用集成的 Swagger 配置
  const { SwaggerIntegration } = await import(
    './config/swagger-integration.js'
  );
  SwaggerIntegration.setupSwagger(app); // 文档访问路径：/docs

  await app.listen(port);

  // 输出服务启动信息（可选）
  // console.log(
  //   `Application is running on: http://localhost:${port}/${apiPrefix}`,
  // );
}

// 启动应用程序
bootstrap();
