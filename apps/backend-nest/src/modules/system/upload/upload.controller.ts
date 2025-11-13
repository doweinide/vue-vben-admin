import path from 'node:path';

import { ApiPost } from '@/decorators/api.decorator';
import { ZodBody, ZodQuery } from '@/decorators/zod-param.decorator';
import {
  ChunkInitRequestSchema,
  ChunkInitResponseSchema,
  ChunkMergeRequestSchema,
  ChunkMergeResponseSchema,
  ChunkUploadFormSchema,
  ChunkUploadQuerySchema,
  UploadFormSchema,
  UploadQuerySchema,
  UploadResponseSchema,
} from '@/schemas';
import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';

import { UploadService } from './upload.service';

/**
 * 上传控制器
 *
 * 提供文件上传与分片上传相关接口：
 * - 文件直传：支持单/多文件，自动按类型分类保存
 * - 分片初始化：返回缺失的分片索引，用于断点续传
 * - 分片上传：逐片写入到临时目录
 * - 分片合并：合并所有已上传分片生成最终文件
 *
 * 返回统一三段式格式：`{ code, message, data }`
 */

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
  ) {}

  @ApiPost({
    path: 'chunk/init',
    summary: '分片上传初始化',
    description: '返回缺失分片索引',
    tags: ['系统管理'],
    bodySchema: ChunkInitRequestSchema,
    responseSchema: ChunkInitResponseSchema,
    requireAuth: false,
  })
  @HttpCode(HttpStatus.OK)
  async init(@ZodBody() body: typeof ChunkInitRequestSchema.Type) {
    // 计算当前已存在的分片，返回缺失的索引列表
    const res = this.uploadService.initChunks(body);
    return { code: 200, message: '初始化成功', data: res };
  }

  @ApiPost({
    path: 'chunk/merge',
    summary: '合并分片',
    description: '合并已上传分片为完整文件',
    tags: ['系统管理'],
    bodySchema: ChunkMergeRequestSchema,
    responseSchema: ChunkMergeResponseSchema,
    requireAuth: false,
  })
  @HttpCode(HttpStatus.OK)
  async merge(@ZodBody() body: typeof ChunkMergeRequestSchema.Type) {
    // 使用应用端口构建静态资源 URL
    const port = this.configService.get<number>('app.port') || 3333;
    // 合并分片并输出最终文件信息
    const info = await this.uploadService.mergeChunks(
      body.fileMd5,
      body.filename,
      body.mimeType,
      body.subDir,
      port,
    );
    return { code: 200, message: '合并成功', data: info };
  }

  @ApiPost({
    path: '',
    summary: '文件上传',
    description: '支持单文件与多文件上传，按类型分类保存，返回可访问 URL',
    tags: ['系统管理'],
    bodySchema: UploadFormSchema,
    bodyContentType: 'multipart/form-data',
    querySchema: UploadQuerySchema,
    responseSchema: UploadResponseSchema,
    requireAuth: false,
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AnyFilesInterceptor({}))
  async upload(
    @Req() req: any,
    @ZodQuery() query: typeof UploadQuerySchema.Type,
  ) {
    // Multer 支持单文件与多文件两种形式，这里统一为数组
    const files: any[] = req.files || (req.file ? [req.file] : []);
    if (!files || files.length === 0)
      throw new BadRequestException('未选择文件');
    // 使用应用端口构建返回 URL
    const port = this.configService.get<number>('app.port') || 3333;
    const data = await this.uploadService.saveFiles(files, query.subDir, port);
    return { code: 200, message: '上传成功', data: { files: data } };
  }

  @ApiPost({
    path: 'chunk/upload',
    summary: '上传分片',
    description: '上传单个分片',
    tags: ['系统管理'],
    querySchema: ChunkUploadQuerySchema,
    bodySchema: ChunkUploadFormSchema,
    bodyContentType: 'multipart/form-data',
    requireAuth: false,
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('chunk'))
  async uploadChunk(
    @Req() req: any,
    @ZodQuery() query: typeof ChunkUploadQuerySchema.Type,
  ) {
    // 读取当前分片并写入到临时分片目录
    const file = req.file as any;
    if (!file) throw new BadRequestException('缺少分片');
    const root = this.uploadService.getChunkRoot();
    const dir = path.join(root, query.fileMd5);
    const fs = await import('node:fs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const p = path.join(dir, `chunk-${Number(query.index)}`);
    if (file.buffer) {
      await fs.promises.writeFile(p, file.buffer);
    } else if (file.path) {
      await fs.promises.copyFile(file.path, p);
    } else {
      throw new BadRequestException('分片数据缺失');
    }
    return { code: 200, message: '分片上传成功', data: null };
  }
}
