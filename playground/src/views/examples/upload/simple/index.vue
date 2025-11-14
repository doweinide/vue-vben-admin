<script lang="ts" setup>
import type { UploadFile } from 'ant-design-vue';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Button, Card, Input, Upload } from 'ant-design-vue';

import { post_upload } from '#/api/auto-api/system';
import { $t } from '#/locales';

const subDir = ref<string>();
const singleFileList = ref<UploadFile[]>([]);
const multipleFileList = ref<UploadFile[]>([]);

async function customRequest({ file, onProgress, onSuccess, onError }: any) {
  try {
    const rawFile = (file as any)?.originFileObj ?? file;
    const formData = new FormData();
    formData.append('file', rawFile as File);
    const data = await post_upload(
      { body: formData, params: { subDir: subDir.value } },
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e: ProgressEvent) => {
          if (e.total) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress?.({ percent });
          }
        },
      },
    );
    const info = data?.files?.[0];
    const url = info?.url ?? '';
    if (url) {
      try {
        Object.assign(file, { url });
      } catch {}
    }
    onSuccess?.(data, file);
  } catch (error) {
    onError?.(error);
  }
}
</script>

<template>
  <Page title="上传示例">
    <Card title="单文件上传">
      <div class="flex items-center gap-4">
        <Input
          v-model:value="subDir"
          allow-clear
          class="w-60"
          placeholder="子目录（可选）"
        />
        <Upload
          v-model:file-list="singleFileList"
          :custom-request="customRequest"
          :max-count="1"
          :multiple="false"
          :show-upload-list="true"
          accept="*/*"
          list-type="text"
        >
          <Button type="primary">
            <IconifyIcon
              icon="ant-design:upload-outlined"
              class="mr-1 size-5"
            />
            {{ $t('examples.upload.uploadBtn') }}
          </Button>
        </Upload>
      </div>
    </Card>

    <Card class="mt-4" title="多文件上传（图片）">
      <Upload
        v-model:file-list="multipleFileList"
        :custom-request="customRequest"
        :multiple="true"
        :show-upload-list="true"
        accept="image/*"
        list-type="picture-card"
      >
        <div class="flex items-center gap-2">
          <IconifyIcon icon="ant-design:plus-outlined" class="size-5" />
          <span>{{ $t('examples.upload.pickFile') }}</span>
        </div>
      </Upload>
    </Card>
  </Page>
</template>
