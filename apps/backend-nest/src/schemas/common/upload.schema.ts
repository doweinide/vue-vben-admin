import {
  createResponseSchema,
  createSchema,
  z,
} from '@/schemas/base/base.schema';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);
export const UploadCategorySchema = z
  .enum(['image', 'video', 'audio', 'document'])
  .describe('文件类别');

export const UploadQuerySchema = createSchema(
  z.object({
    subDir: z
      .string()
      .regex(/^[\w\-/]{0,64}$/)
      .optional()
      .describe('自定义上传子目录，例如 avatar/banner'),
  }),
  'UploadQuery',
  '上传查询参数',
);

export const UploadFormSchema = createSchema(
  z
    .object({
      file: z
        .any()
        .openapi({ type: 'string', format: 'binary' })
        .describe('上传文件（支持多文件，字段名 file）'),
    })
    .partial(),
  'UploadForm',
  '上传表单（multipart/form-data）',
);

export const UploadedFileInfoSchema = z.object({
  originalName: z.string().describe('原始文件名'),
  filename: z.string().describe('系统保存的唯一文件名'),
  md5: z.string().describe('文件MD5值（用于去重）'),
  size: z.number().describe('文件大小（字节）'),
  mimeType: z.string().describe('文件MIME类型'),
  category: UploadCategorySchema.describe('文件类别'),
  url: z.string().describe('文件可访问 URL'),
  path: z.string().describe('静态资源相对路径'),
  subDir: z.string().optional().describe('自定义上传子目录'),
  dedup: z.boolean().optional().describe('是否命中去重'),
});

export const UploadResponseSchema = createResponseSchema(
  z.object({ files: z.array(UploadedFileInfoSchema) }),
  'UploadResponse',
  '上传响应',
);

export const ChunkInitRequestSchema = createSchema(
  z.object({
    fileMd5: z.string().describe('文件MD5值（用于分片标识和断点续传）'),
    filename: z.string().describe('原始文件名'),
    mimeType: z.string().describe('文件MIME类型'),
    totalSize: z.number().int().positive().describe('文件总大小（字节）'),
    chunkSize: z.number().int().positive().describe('单个分片大小（字节）'),
    totalChunks: z.number().int().positive().describe('分片总数'),
    subDir: z
      .string()
      .regex(/^[\w\-/]{0,64}$/)
      .optional()
      .describe('自定义上传子目录'),
  }),
  'ChunkInitRequest',
  '分片初始化请求',
);

export const ChunkInitResponseSchema = createResponseSchema(
  z.object({
    missing: z
      .array(z.number().int().nonnegative())
      .describe('缺失分片索引列表（从0开始）'),
  }),
  'ChunkInitResponse',
  '分片初始化响应',
);

export const ChunkUploadQuerySchema = createSchema(
  z.object({
    fileMd5: z.string().describe('文件MD5值（分片目录标识）'),
    index: z.number().int().nonnegative().describe('分片索引（从0开始）'),
    subDir: z
      .string()
      .regex(/^[\w\-/]{0,64}$/)
      .optional()
      .describe('自定义上传子目录'),
  }),
  'ChunkUploadQuery',
  '分片上传查询参数',
);

export const ChunkUploadFormSchema = createSchema(
  z
    .object({
      chunk: z
        .any()
        .openapi({ type: 'string', format: 'binary' })
        .describe('上传的分片数据（字段名 chunk）'),
    })
    .partial(),
  'ChunkUploadForm',
  '分片上传表单（multipart/form-data）',
);

export const ChunkMergeRequestSchema = createSchema(
  z.object({
    fileMd5: z.string().describe('文件MD5值（目标文件唯一标识）'),
    filename: z.string().describe('原始文件名（用于扩展名补全）'),
    mimeType: z.string().describe('文件MIME类型'),
    subDir: z
      .string()
      .regex(/^[\w\-/]{0,64}$/)
      .optional()
      .describe('自定义上传子目录'),
  }),
  'ChunkMergeRequest',
  '分片合并请求',
);

export const ChunkMergeResponseSchema = createResponseSchema(
  UploadedFileInfoSchema,
  'ChunkMergeResponse',
  '分片合并响应',
);
