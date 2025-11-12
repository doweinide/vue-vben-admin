<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { $t } from '#/locales';
import { useSystemStore } from '#/store/system';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const systemStore = useSystemStore();

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

/**
 * 编辑用户
 * @param row
 */
function onEdit(row: any) {
  formModalApi.setData(row).open();
}

/**
 * 创建新用户
 */
function onCreate() {
  formModalApi.setData(null).open();
}

/**
 * 删除用户
 * @param row
 */
async function onDelete(row: any) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.username]),
    duration: 0,
    key: 'action_process_msg',
  });
  try {
    await systemStore.deleteUser(row.id);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess', [row.username]),
      key: 'action_process_msg',
    });
    refreshGrid();
  } catch {
    hideLoading();
  }
}

/**
 * 表格操作按钮的回调函数
 */
function onActionClick({ code, row }: OnActionClickParams<any>) {
  switch (code) {
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
  }
}

async function onStatusChange(newStatus: number, row: any) {
  const status: Record<number, string> = { 0: '禁用', 1: '启用' };
  try {
    await new Promise((resolve, reject) => {
      Modal.confirm({
        title: '切换状态',
        content: `你要将${row.username}的状态切换为 【${status[newStatus]}】 吗？`,
        onOk: () => resolve(true),
        onCancel: () => reject(new Error('已取消')),
      });
    });
    await systemStore.updateUser(row.id, { status: newStatus });
    return true;
  } catch {
    return false;
  }
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents: {},
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: true,
      pageSize: 10,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          const response = await systemStore.fetchUsers({
            page: page.currentPage,
            limit: page.pageSize,
            ...formValues,
          });
          return {
            items: response.items || [],
            total: response.total || 0,
          };
        },
      },
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions,
});

/**
 * 刷新表格
 */
function refreshGrid() {
  gridApi.query();
}
</script>
<template>
  <Page auto-content-height>
    <FormModal @success="refreshGrid" />
    <Grid table-title="用户列表">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.user.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
