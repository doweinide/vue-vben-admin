import { createHash } from 'node:crypto';
import {
  createReadStream,
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  statSync,
} from 'node:fs';
import path from 'node:path';

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type Category = 'audio' | 'document' | 'image' | 'video';

const EXT_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/bmp': '.bmp',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/ogg': '.ogv',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/webm': '.weba',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/plain': '.txt',
};

const WHITELIST: Record<Category, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
};

/**
 * 上传服务
 *
 * 负责文件保存、类型校验、MD5 去重、分片管理与合并：
 * - saveFiles：处理直传文件，校验类型与大小，生成唯一文件名
 * - initChunks：分片初始化，返回缺失分片索引用于断点续传
 * - mergeChunks：合并所有分片，生成最终文件并清理临时分片
 * - getChunkRoot/getRoot：统一管理上传根目录与分片目录
 */
@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * 获取分片存储根目录
   * 位于上传目录下的 `.chunks` 子目录
   */
  getChunkRoot(): string {
    return path.join(this.getRoot(), '.chunks');
  }

  /**
   * 分片初始化
   * 根据 `totalChunks` 检查已存在的分片文件，返回缺失索引
   */
  initChunks(payload: {
    chunkSize: number;
    fileMd5: string;
    filename: string;
    mimeType: string;
    subDir?: string;
    totalChunks: number;
    totalSize: number;
  }) {
    const dir = path.join(this.getChunkRoot(), payload.fileMd5);
    this.ensureDir(dir);
    const missing: number[] = [];
    for (let i = 0; i < payload.totalChunks; i++) {
      const p = path.join(dir, `chunk-${i}`);
      if (!existsSync(p)) missing.push(i);
    }
    return { missing };
  }

  /**
   * 合并分片并生成最终文件
   * - 自动根据 mimeType/filename 判断扩展名
   * - 若已存在同 MD5 文件，直接返回去重信息
   * - 合并完成后清理分片目录
   */
  async mergeChunks(
    fileMd5: string,
    filename: string,
    mimeType: string,
    subDir: string | undefined,
    port?: number,
  ) {
    const dir = path.join(this.getChunkRoot(), fileMd5);
    const cat = this.detectCategory(mimeType);
    const ext = EXT_MAP[mimeType] ?? path.extname(filename) ?? '';
    const safeSub = this.sanitizeSubDir(subDir);
    const root = this.getRoot();
    let folder: string;
    switch (cat) {
      case 'audio': {
        folder = 'audios';

        break;
      }
      case 'image': {
        folder = 'images';

        break;
      }
      case 'video': {
        folder = 'videos';

        break;
      }
      default: {
        folder = 'documents';
      }
    }
    const baseDir = path.join(root, folder, safeSub ?? '');
    this.ensureDir(baseDir);

    const finalName = `${fileMd5}${ext}`;
    const finalPath = path.join(baseDir, finalName);
    if (existsSync(finalPath)) {
      return this.buildFileInfo(
        filename,
        finalName,
        fileMd5,
        statSync(finalPath).size,
        mimeType,
        cat,
        safeSub,
        true,
        port,
      );
    }

    // 依次按顺序读取分片文件进行合并
    const chunks: string[] = [];
    let idx = 0;
    while (true) {
      const p = path.join(dir, `chunk-${idx}`);
      if (!existsSync(p)) break;
      chunks.push(p);
      idx++;
    }
    if (chunks.length === 0) throw new BadRequestException('缺少分片');

    // 先写入到临时文件，再原子重命名到目标路径
    const write = renameSync;
    const tmpPath = path.join(root, 'tmp', `${fileMd5}.merge`);
    this.ensureDir(path.dirname(tmpPath));
    const target = finalPath;
    const fs = await import('node:fs');
    const ws = fs.createWriteStream(tmpPath);
    await new Promise<void>((resolve, reject) => {
      const pipeNext = (i: number) => {
        if (i >= chunks.length) {
          ws.end();
          resolve();
          return;
        }
        const rs = createReadStream(chunks[i]);
        rs.on('error', reject);
        rs.on('end', () => pipeNext(i + 1));
        rs.pipe(ws, { end: false });
      };
      pipeNext(0);
    });
    write(tmpPath, target);

    const size = statSync(target).size;
    // 清理所有分片与分片目录
    for (const p of chunks) rmSync(p, { force: true });
    rmSync(dir, { force: true, recursive: true });
    return this.buildFileInfo(
      filename,
      finalName,
      fileMd5,
      size,
      mimeType,
      cat,
      safeSub,
      false,
      port,
    );
  }

  /**
   * 保存上传文件（直传）
   * - 校验文件类型与大小
   * - 计算 MD5 并生成唯一文件名
   * - 去重：若已存在同 MD5 文件则复用
   */
  async saveFiles(files: any[], subDir?: string, port?: number) {
    if (!files || files.length === 0) throw new BadRequestException('空文件');

    const root = this.getRoot();
    const tmp = path.join(root, 'tmp');
    this.ensureDir(tmp);

    const results: any[] = [];
    for (const f of files) {
      const root = this.getRoot();
      const tmp = path.join(root, 'tmp');
      this.ensureDir(tmp);
      const tmpName = `tmp-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}${path.extname(f.originalname) || ''}`;
      const tmpPath = path.join(tmp, tmpName);
      const fs = await import('node:fs');
      if (f.buffer) await fs.promises.writeFile(tmpPath, f.buffer);
      const size = statSync(tmpPath).size;
      if (!size) {
        rmSync(tmpPath, { force: true });
        throw new BadRequestException('空文件');
      }
      const cat = this.detectCategory(f.mimetype);
      const allowed = WHITELIST[cat];
      if (!allowed.includes(f.mimetype)) {
        rmSync(tmpPath, { force: true });
        throw new BadRequestException('不支持的文件类型');
      }
      const maxBytes = this.getMaxBytes(cat);
      if (size > maxBytes) {
        rmSync(tmpPath, { force: true });
        throw new BadRequestException('文件过大');
      }
      const md5 = await this.computeMd5(tmpPath);
      const ext = EXT_MAP[f.mimetype] ?? path.extname(f.originalname) ?? '';
      const safeSub = this.sanitizeSubDir(subDir);
      let folder: string;
      switch (cat) {
        case 'audio': {
          folder = 'audios';

          break;
        }
        case 'image': {
          folder = 'images';

          break;
        }
        case 'video': {
          folder = 'videos';

          break;
        }
        default: {
          folder = 'documents';
        }
      }
      const baseDir = path.join(root, folder, safeSub ?? '');
      this.ensureDir(baseDir);

      const finalName = `${md5}${ext}`;
      const finalPath = path.join(baseDir, finalName);
      let dedup = false;
      if (existsSync(finalPath)) {
        rmSync(tmpPath, { force: true });
        dedup = true;
      } else {
        renameSync(tmpPath, finalPath);
      }

      switch (cat) {
        case 'audio': {
          folder = 'audios';

          break;
        }
        case 'image': {
          folder = 'images';

          break;
        }
        case 'video': {
          folder = 'videos';

          break;
        }
        default: {
          folder = 'documents';
        }
      }
      const rel = path
        .join('/uploads', folder, safeSub ?? '', finalName)
        .replaceAll('\\', '/');
      const url = `http://localhost:${port ?? 3333}${rel}`;
      results.push({
        originalName: f.originalname,
        filename: finalName,
        md5,
        size,
        mimeType: f.mimetype,
        category: cat,
        url,
        path: rel,
        subDir: safeSub,
        dedup,
      });
    }
    return results;
  }

  /**
   * 构建统一的文件信息返回体
   */
  private buildFileInfo(
    originalName: string,
    filename: string,
    md5: string,
    size: number,
    mimeType: string,
    category: Category,
    subDir?: string,
    dedup?: boolean,
    port?: number,
  ) {
    let folder: string;
    switch (category) {
      case 'audio': {
        folder = 'audios';

        break;
      }
      case 'image': {
        folder = 'images';

        break;
      }
      case 'video': {
        folder = 'videos';

        break;
      }
      default: {
        folder = 'documents';
      }
    }
    const rel = path
      .join('/uploads', folder, subDir ?? '', filename)
      .replaceAll('\\', '/');
    const url = `http://localhost:${port ?? 3333}${rel}`;
    return {
      originalName,
      filename,
      md5,
      size,
      mimeType,
      category,
      url,
      path: rel,
      subDir,
      dedup,
    };
  }

  /**
   * 计算文件的 MD5 哈希
   */
  private async computeMd5(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('md5');
      const rs = createReadStream(filePath);
      rs.on('error', reject);
      rs.on('data', (d) => hash.update(d));
      rs.on('end', () => resolve(hash.digest('hex')));
    });
  }

  /**
   * 根据 MIME 推断文件类别
   */
  private detectCategory(mime: string): Category {
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (mime.startsWith('audio/')) return 'audio';
    return 'document';
  }

  /**
   * 保证目录存在（递归创建）
   */
  private ensureDir(p: string) {
    if (!existsSync(p)) mkdirSync(p, { recursive: true });
  }

  /**
   * 获取不同类别的最大允许字节数
   * 支持通过配置 `app.uploads.maxSizeBytes` 覆盖
   */
  private getMaxBytes(cat: Category): number {
    const base = this.configService.get('app');
    const defaults: Record<Category, number> = {
      image: 5 * 1024 * 1024,
      video: 50 * 1024 * 1024,
      audio: 10 * 1024 * 1024,
      document: 20 * 1024 * 1024,
    };
    const cfg = (base as any)?.uploads?.maxSizeBytes as
      | Record<Category, number>
      | undefined;
    return cfg?.[cat] ?? defaults[cat];
  }

  /**
   * 获取上传根目录
   * 优先读取配置 `app.uploads.root`，默认使用 `process.cwd()/uploads`
   */
  private getRoot(): string {
    const appCfg = this.configService.get('app') as any;
    const root: string = appCfg?.uploads?.root;
    return root || path.resolve(process.cwd(), 'uploads');
  }

  /**
   * 清理并安全化子目录参数
   * 只允许 `\w`、`-`、`/`，并去掉首尾斜杠与 `..`
   */
  private sanitizeSubDir(sub?: string): string | undefined {
    if (!sub) return undefined;
    const safe = sub.replaceAll(/[^\w\-/]/g, '');
    if (safe.includes('..')) return undefined;
    return safe.replaceAll(/^\/+|\/+$/g, '');
  }
}
