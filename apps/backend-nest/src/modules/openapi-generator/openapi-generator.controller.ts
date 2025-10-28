import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { OpenApiGeneratorService } from './openapi-generator.service';

@ApiTags('OpenAPI Generator')
@Controller('api/openapi-generator')
export class OpenApiGeneratorController {
  private readonly logger = new Logger(OpenApiGeneratorController.name);

  constructor(
    private readonly openApiGeneratorService: OpenApiGeneratorService,
  ) {}

  @Post('generate-types')
  async generateTypes(@Body() body?: { createByTags?: boolean }) {
    try {
      this.logger.log('开始生成 TypeScript 类型文件...');
      const result = await this.openApiGeneratorService.generateTypescriptFiles(
        body?.createByTags,
      );
      this.logger.log(`成功生成 TypeScript 类型文件到: ${result.outputPath}`);

      return {
        success: true,
        message: '成功生成 TypeScript 类型文件',
        outputPath: result.outputPath,
        generatedFiles: result.generatedFiles,
      };
    } catch (error) {
      this.logger.error('生成 TypeScript 类型文件失败:', error);

      return {
        success: false,
        message: '生成 TypeScript 类型文件失败',
        error: error.message,
      };
    }
  }
}
