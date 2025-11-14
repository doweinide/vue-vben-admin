<script lang="ts" setup>
import { computed, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Card, message, Progress, Tag, Upload } from 'ant-design-vue';

import {
  post_upload_chunk_init,
  post_upload_chunk_merge,
  post_upload_chunk_upload,
} from '#/api/auto-api/system';
import { $t } from '#/locales';

interface ChunkUploadState {
  chunkSize: number;
  estimatedTime: number; // seconds remaining
  file: File | null;
  fileMd5: string;
  paused: boolean;
  percent: number;
  resultUrl: null | string;
  startTime: null | number;
  totalChunks: number;
  uploadedChunks: number[];
  uploading: boolean;
  uploadSpeed: number; // bytes per second
}

const uploadState = ref<ChunkUploadState>({
  file: null,
  uploading: false,
  paused: false,
  percent: 0,
  resultUrl: null,
  uploadedChunks: [],
  totalChunks: 0,
  chunkSize: 5 * 1024 * 1024, // 5MB
  fileMd5: '',
  uploadSpeed: 0,
  startTime: null,
  estimatedTime: 0,
});

const fileInput = ref<File | null>(null);

const uploadProgress = computed(() => {
  if (uploadState.value.totalChunks === 0) return 0;
  return Math.round(
    (uploadState.value.uploadedChunks.length / uploadState.value.totalChunks) *
      100,
  );
});

const fileSizeFormatted = computed(() => {
  if (!uploadState.value.file) return '0 B';
  return formatFileSize(uploadState.value.file.size);
});

const uploadSpeedFormatted = computed(() => {
  return `${formatFileSize(uploadState.value.uploadSpeed)}/s`;
});

const estimatedTimeFormatted = computed(() => {
  const seconds = uploadState.value.estimatedTime;
  if (seconds < 60) return `${Math.ceil(seconds)}秒`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.ceil(seconds % 60);
  return `${minutes}分${remainingSeconds}秒`;
});

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

async function computeHash(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buf);
  const view = new Uint8Array(digest);
  let hex = '';
  for (const element of view) {
    hex += (element ?? 0).toString(16).padStart(2, '0');
  }
  return hex;
}

function beforeUpload(file: File) {
  uploadState.value.file = file;
  fileInput.value = file;
  return false;
}

function resetUpload() {
  uploadState.value = {
    file: null,
    uploading: false,
    paused: false,
    percent: 0,
    resultUrl: null,
    uploadedChunks: [],
    totalChunks: 0,
    chunkSize: 5 * 1024 * 1024,
    fileMd5: '',
    uploadSpeed: 0,
    startTime: null,
    estimatedTime: 0,
  };
  fileInput.value = null;
}

function pauseUpload() {
  uploadState.value.paused = true;
  message.info('上传已暂停');
}

function resumeUpload() {
  uploadState.value.paused = false;
  message.info('上传已继续');
  startChunkUpload();
}

async function startUpload() {
  if (!uploadState.value.file) {
    message.warning('请先选择文件');
    return;
  }

  // Check file size (recommend for large files)
  if (uploadState.value.file.size < uploadState.value.chunkSize) {
    message.warning('文件太小，建议使用简单上传');
    return;
  }

  uploadState.value.uploading = true;
  uploadState.value.paused = false;
  uploadState.value.percent = 0;
  uploadState.value.resultUrl = null;
  uploadState.value.startTime = Date.now();

  try {
    uploadState.value.fileMd5 = await computeHash(uploadState.value.file);
    uploadState.value.totalChunks = Math.ceil(
      uploadState.value.file.size / uploadState.value.chunkSize,
    );

    const init = await post_upload_chunk_init({
      body: {
        fileMd5: uploadState.value.fileMd5,
        filename: uploadState.value.file.name,
        mimeType: uploadState.value.file.type || 'application/octet-stream',
        totalSize: uploadState.value.file.size,
        chunkSize: uploadState.value.chunkSize,
        totalChunks: uploadState.value.totalChunks,
        subDir: 'examples/chunks',
      },
    });

    const missing = (init?.missing || []) as number[];
    uploadState.value.uploadedChunks = Array.from(
      { length: uploadState.value.totalChunks },
      (_, i) => i,
    ).filter((i) => !missing.includes(i));

    await startChunkUpload();
  } catch (error: any) {
    message.error(`初始化上传失败: ${String(error?.message || error)}`);
    uploadState.value.uploading = false;
  }
}

async function startChunkUpload() {
  const file = uploadState.value.file!;
  const missing = Array.from(
    { length: uploadState.value.totalChunks },
    (_, i) => i,
  ).filter((i) => !uploadState.value.uploadedChunks.includes(i));

  for (const idx of missing) {
    if (uploadState.value.paused) {
      message.info('上传已暂停，等待继续...');
      return;
    }

    if (idx === undefined) continue;

    const start = idx * uploadState.value.chunkSize;
    const end = Math.min(start + uploadState.value.chunkSize, file.size);
    const blob = file.slice(start, end);
    const fd = new FormData();
    fd.append('chunk', blob);

    try {
      const startTime = Date.now();
      await post_upload_chunk_upload(
        {
          params: {
            fileMd5: uploadState.value.fileMd5,
            index: idx,
            subDir: 'examples/chunks',
          },
          body: fd,
        },
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      const uploadTime = (Date.now() - startTime) / 1000; // seconds
      const chunkSize = blob.size;
      uploadState.value.uploadSpeed = chunkSize / uploadTime;

      uploadState.value.uploadedChunks.push(idx);
      uploadState.value.percent = Math.round(
        (uploadState.value.uploadedChunks.length /
          uploadState.value.totalChunks) *
          100,
      );

      // Calculate estimated time
      const remainingChunks =
        uploadState.value.totalChunks - uploadState.value.uploadedChunks.length;
      uploadState.value.estimatedTime = remainingChunks * uploadTime;
    } catch (error: any) {
      message.error(
        `上传分片 ${idx + 1} 失败: ${String(error?.message || error)}`,
      );
      uploadState.value.uploading = false;
      return;
    }
  }

  try {
    const merged = await post_upload_chunk_merge({
      body: {
        fileMd5: uploadState.value.fileMd5,
        filename: uploadState.value.file!.name,
        mimeType: uploadState.value.file!.type || 'application/octet-stream',
        subDir: 'examples/chunks',
      },
    });

    uploadState.value.resultUrl = merged?.url || null;
    uploadState.value.uploading = false;

    if (uploadState.value.resultUrl) {
      message.success(
        `${$t('examples.form.upload-urls')}: ${uploadState.value.resultUrl}`,
      );
    }
  } catch (error: any) {
    message.error(`合并文件失败: ${String(error?.message || error)}`);
    uploadState.value.uploading = false;
  }
}
</script>

<template>
  <Page
    content-class="flex flex-col gap-6"
    :title="$t('examples.upload.chunk')"
  >
    <Card class="overflow-hidden">
      <template #title>
        <div class="flex items-center justify-between py-3">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                />
              </svg>
            </div>
            <div>
              <div class="text-lg font-semibold text-gray-800">
                分片上传管理
              </div>
              <div class="text-sm text-gray-600">
                支持超大文件上传，具备断点续传、暂停/继续功能
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Tag color="blue" v-if="uploadState.file">
              {{ uploadState.file.name }}
            </Tag>
            <Tag color="green" v-if="uploadState.resultUrl"> 上传完成 </Tag>
          </div>
        </div>
      </template>

      <div class="flex flex-col gap-6">
        <!-- File Selection -->
        <div
          class="rounded-xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50 p-6 transition-all duration-300 hover:border-blue-300 hover:shadow-md"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <Upload
                :before-upload="beforeUpload"
                :max-count="1"
                :show-upload-list="false"
              >
                <Button type="primary" size="large">
                  <template #icon>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                    </svg>
                  </template>
                  选择大文件
                </Button>
              </Upload>

              <div v-if="uploadState.file" class="flex flex-col">
                <div class="text-sm font-medium text-gray-800">
                  {{ uploadState.file.name }}
                </div>
                <div class="text-xs text-gray-600">{{ fileSizeFormatted }}</div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Button
                v-if="!uploadState.uploading"
                type="primary"
                size="large"
                :disabled="!uploadState.file"
                @click="startUpload"
              >
                <template #icon>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </template>
                开始上传
              </Button>

              <Button
                v-if="uploadState.uploading && !uploadState.paused"
                type="default"
                size="large"
                @click="pauseUpload"
              >
                <template #icon>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                </template>
                暂停
              </Button>

              <Button
                v-if="uploadState.uploading && uploadState.paused"
                type="primary"
                size="large"
                @click="resumeUpload"
              >
                <template #icon>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </template>
                继续
              </Button>

              <Button
                v-if="uploadState.uploading || uploadState.resultUrl"
                type="default"
                size="large"
                danger
                @click="resetUpload"
              >
                <template #icon>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
                    />
                  </svg>
                </template>
                重置
              </Button>
            </div>
          </div>
        </div>

        <!-- Progress Information -->
        <div
          v-if="uploadState.uploading || uploadState.percent > 0"
          class="rounded-lg bg-gray-50 p-4"
        >
          <div class="mb-3 flex items-center justify-between">
            <div class="text-sm font-medium text-gray-800">上传进度</div>
            <div class="text-sm text-gray-600">
              {{ uploadState.uploadedChunks.length }} /
              {{ uploadState.totalChunks }} 分片
            </div>
          </div>

          <Progress
            :percent="uploadProgress"
            :stroke-color="{
              '0%': '#108ee9',
              '100%': '#87d068',
            }"
            :stroke-width="8"
            status="active"
          />

          <div class="mt-3 grid grid-cols-3 gap-4 text-center">
            <div class="rounded-lg bg-white p-3">
              <div class="text-xs text-gray-600">上传速度</div>
              <div class="text-lg font-semibold text-blue-600">
                {{ uploadSpeedFormatted }}
              </div>
            </div>
            <div class="rounded-lg bg-white p-3">
              <div class="text-xs text-gray-600">预计剩余时间</div>
              <div class="text-lg font-semibold text-green-600">
                {{ estimatedTimeFormatted }}
              </div>
            </div>
            <div class="rounded-lg bg-white p-3">
              <div class="text-xs text-gray-600">文件大小</div>
              <div class="text-lg font-semibold text-purple-600">
                {{ fileSizeFormatted }}
              </div>
            </div>
          </div>
        </div>

        <!-- Result -->
        <div v-if="uploadState.resultUrl" class="rounded-lg bg-green-50 p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <div>
                <div class="text-sm font-medium text-green-800">上传完成！</div>
                <div class="text-xs text-green-600">文件已成功上传到服务器</div>
              </div>
            </div>
            <a
              :href="uploadState.resultUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-md bg-green-100 px-4 py-2 text-sm font-medium text-green-700 transition-colors duration-200 hover:bg-green-200"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"
                />
              </svg>
              查看文件
            </a>
          </div>
        </div>
      </div>
    </Card>
  </Page>
</template>
