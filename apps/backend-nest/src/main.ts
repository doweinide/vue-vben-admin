import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // Swagger API 文档配置
  // 自动生成 API 文档，便于开发和测试
  const config = new DocumentBuilder()
    .setTitle('Vben Backend API')
    .setDescription(
      '基于 NestJS 构建的现代化后端 API 服务，提供用户管理、认证授权等核心功能',
    )
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: '请输入 JWT token',
      in: 'header',
    }) // 添加 Bearer Token 认证
    .addTag('认证管理', '用户登录、注册、token 验证等认证相关接口')
    .addTag('用户管理', '用户信息的增删改查、权限管理等接口')
    .addTag('系统管理', '应用程序基础接口，包括健康检查、欢迎信息等')
    .addServer(`http://localhost:${port}`, '本地开发环境')
    .addServer(
      `http://localhost:${port}/${apiPrefix}`,
      '本地开发环境 (带API前缀)',
    )
    .setContact(
      'Vben Team',
      'https://github.com/vbenjs/vue-vben-admin',
      'support@vben.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    deepScanRoutes: true,
  });

  SwaggerModule.setup('docs', app, document, {
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
  }); // 文档访问路径：/docs

  await app.listen(port);

  // 输出服务启动信息（可选）
  // console.log(
  //   `Application is running on: http://localhost:${port}/${apiPrefix}`,
  // );
}

// 启动应用程序
bootstrap();
