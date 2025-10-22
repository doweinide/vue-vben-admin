import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';

/**
 * 应用程序根模块
 *
 * 作为整个应用的入口模块，负责组织和配置所有功能模块
 * 包含全局配置、数据库连接、业务模块等
 *
 * 模块结构：
 * - ConfigModule: 全局配置管理
 * - PrismaModule: 数据库访问服务
 * - UserModule: 用户管理模块
 * - AuthModule: 认证授权模块
 * - AppController: 根控制器
 * - AppService: 根服务
 */
@Module({
  imports: [
    // 全局配置模块
    // 加载应用配置和数据库配置，在整个应用中可用
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局模块
      load: [appConfig, databaseConfig], // 加载配置文件
    }),

    // 数据库访问模块（全局）
    PrismaModule,

    // 业务功能模块
    UserModule, // 用户管理
    AuthModule, // 认证授权
  ],
  controllers: [AppController], // 根控制器
  providers: [
    AppService, // 根服务
    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
