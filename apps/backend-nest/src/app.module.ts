import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, DiscoveryModule } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { PathCollector } from './config/path-collector';
import { ResponseFormatInterceptor } from './interceptors/response-format.interceptor';
import { OpenApiGeneratorModule } from './modules/docs/openapi-generator/openapi-generator.module';
import { AuthModule } from './modules/system/auth/auth.module';
import { DepartmentModule } from './modules/system/department/department.module';
import { MenuModule } from './modules/system/menu/menu.module';
import { RoleModule } from './modules/system/role/role.module';
import { UserModule } from './modules/system/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { TestValidationController } from './test-validation.controller';

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
 * - DepartmentModule: 部门管理模块
 * - MenuModule: 菜单管理模块
 * - RoleModule: 角色管理模块
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

    // 发现模块，用于路径收集器
    DiscoveryModule,

    // 数据库访问模块（全局）
    PrismaModule,

    // 业务模块
    UserModule, // 用户管理
    AuthModule, // 认证授权
    DepartmentModule, // 部门管理
    MenuModule, // 菜单管理
    RoleModule, // 角色管理
    OpenApiGeneratorModule, // OpenAPI 类型生成器
  ],
  controllers: [AppController, TestValidationController], // 根控制器
  providers: [
    AppService, // 根服务
    PathCollector, // 路径收集器
    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // 全局响应格式拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseFormatInterceptor,
    },
  ],
})
export class AppModule {}
