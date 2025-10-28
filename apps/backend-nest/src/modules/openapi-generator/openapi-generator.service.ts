import type { GeneratorConfig } from '../../utils/openApi-to-ts/types/openapi';

import * as fs from 'node:fs';
import * as path from 'node:path';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { generateTypeScriptCode } from '../../utils/openApi-to-ts';

@Injectable()
export class OpenApiGeneratorService {
  private readonly logger = new Logger(OpenApiGeneratorService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateTypescriptFiles(createByTags?: boolean) {
    try {
      // 获取当前后端的 openapi.json
      const openApiJsonPath = this.getOpenApiJsonPath();
      const openApiJson = await this.loadOpenApiJson(openApiJsonPath);

      // 配置输出目录
      const outputPath = String.raw`F:\github_product\vben3_backend_font\playground\src\api\auto-api`;

      // 清理输出目录
      await this.cleanOutputDirectory(outputPath);

      // 确保输出目录存在
      await this.ensureDirectoryExists(outputPath);

      // 配置生成器
      const config: Partial<GeneratorConfig> = {
        separateTypes: true,
        includeComments: true,
        generateIndex: true,
        generateUtils: true,
        functionNaming: 'snake_case',
        typeNaming: 'snake_case',
        createByTags: createByTags ?? false,
        importTemplate:
          "import { requestClient as request } from '#/api/request';",
      };

      // 生成 TypeScript 代码
      this.logger.log('开始生成 TypeScript 代码...');
      const result = await generateTypeScriptCode(openApiJson, config);

      // 写入生成的文件
      const generatedFiles: string[] = [];
      for (const file of result.files) {
        const filePath = path.join(outputPath, file.filename);
        await fs.promises.writeFile(filePath, file.content, 'utf8');
        generatedFiles.push(file.filename);
        this.logger.log(`已生成文件: ${file.filename}`);
      }

      return {
        success: true,
        outputPath,
        generatedFiles,
        message: `成功生成 ${generatedFiles.length} 个文件`,
      };
    } catch (error) {
      this.logger.error('生成 TypeScript 文件失败:', error);
      throw error;
    }
  }

  private async cleanOutputDirectory(dirPath: string): Promise<void> {
    try {
      // 检查目录是否存在
      await fs.promises.access(dirPath);

      // 读取目录中的所有文件
      const files = await fs.promises.readdir(dirPath);

      // 删除所有文件
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = await fs.promises.stat(filePath);

        stat.isDirectory()
          ? // 如果是目录，递归删除
            await fs.promises.rmdir(filePath, { recursive: true })
          : // 如果是文件，直接删除
            await fs.promises.unlink(filePath);
      }

      this.logger.log(`已清理输出目录: ${dirPath}`);
    } catch (error) {
      // 目录不存在或其他错误，忽略
      this.logger.log(`清理目录时出现错误（可能目录不存在）: ${error.message}`);
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.promises.access(dirPath);
    } catch {
      // 目录不存在，创建它
      await fs.promises.mkdir(dirPath, { recursive: true });
      this.logger.log(`已创建输出目录: ${dirPath}`);
    }
  }

  private getOpenApiJsonPath(): string {
    // 获取 openapi.json 的路径，通常在应用启动时会生成
    const possiblePaths = [
      path.join(process.cwd(), 'openapi.json'),
      path.join(process.cwd(), 'docs', 'openapi.json'),
      path.join(process.cwd(), 'swagger', 'openapi.json'),
    ];

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }

    throw new Error('找不到 openapi.json 文件，请确保 Swagger 文档已生成');
  }

  private async loadOpenApiJson(filePath: string): Promise<any> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`读取 openapi.json 文件失败: ${error.message}`);
    }
  }
}
