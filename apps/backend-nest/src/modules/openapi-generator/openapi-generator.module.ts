import { Module } from '@nestjs/common';

import { OpenApiGeneratorController } from './openapi-generator.controller';
import { OpenApiGeneratorService } from './openapi-generator.service';

@Module({
  controllers: [OpenApiGeneratorController],
  providers: [OpenApiGeneratorService],
  exports: [OpenApiGeneratorService],
})
export class OpenApiGeneratorModule {}
