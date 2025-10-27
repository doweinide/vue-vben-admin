import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

/**
 * 路径收集器
 *
 * 在应用启动后通过反射收集所有控制器的路径信息
 * 并构建完整的API路径用于OpenAPI文档生成
 */
@Injectable()
export class PathCollector {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 收集所有API路径配置
   *
   * @returns 完整的路径配置数组
   */
  collectAllPaths(): any[] {
    const controllers = this.discoveryService.getControllers();
    const allPaths: any[] = [];

    for (const controller of controllers) {
      const { instance } = controller;
      const controllerClass = instance.constructor;

      // 获取控制器路径前缀
      const controllerPath = this.reflector.get('path', controllerClass) || '';

      // 获取控制器的所有方法
      const methodNames = this.metadataScanner.getAllMethodNames(instance);

      for (const methodName of methodNames) {
        const method = instance[methodName];

        // 获取方法的API配置
        const apiConfig = this.reflector.get('api:config', method);

        if (apiConfig) {
          // 构建完整路径
          const fullPath = this.buildFullPath(controllerPath, apiConfig.path);

          // 创建完整的路径配置
          const fullPathConfig = {
            ...apiConfig,
            path: fullPath,
            // 添加唯一标识，避免路径冲突
            operationId: `${controllerClass.name}_${methodName}`,
          };

          allPaths.push(fullPathConfig);
        }
      }
    }

    return allPaths;
  }

  /**
   * 构建完整的API路径
   *
   * @param controllerPath 控制器路径
   * @param methodPath 方法路径
   * @returns 完整路径，包含API前缀用于Swagger文档显示
   */
  private buildFullPath(controllerPath: string, methodPath: string): string {
    // 清理路径，移除多余的斜杠
    const cleanControllerPath = controllerPath.replaceAll(/^\/+|\/+$/g, '');
    const cleanMethodPath = methodPath.replaceAll(/^\/+|\/+$/g, '');

    // 从配置中获取API前缀，确保与应用设置一致
    const apiPrefix = this.configService.get<string>('app.apiPrefix') || 'api';

    // 构建完整路径，包含API前缀，这样Swagger文档显示的路径与实际请求路径一致
    const parts = [apiPrefix, cleanControllerPath, cleanMethodPath].filter(
      Boolean,
    );
    return `/${parts.join('/')}`;
  }
}
