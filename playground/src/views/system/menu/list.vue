<script lang="ts" setup>
import type { RouteRecordRaw } from 'vue-router';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { get_system_menu_list_response } from '#/api/auto-api/types';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon, Plus } from '@vben/icons';
import { $t } from '@vben/locales';
// import { useAccessStore } from '@vben/stores';

import { MenuBadge } from '@vben-core/menu-ui';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  delete_system_menu_id,
  get_system_menu_list,
  patch_system_menu_id,
  post_system_menu_sync,
} from '#/api/auto-api/menu';
import { accessRoutes } from '#/router/routes';
import { componentKeys } from '#/router/routes/index';
// 使用 auto-api 的封装方法，不直接调用通用 request

import { useColumns } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params) => {
          // backend now returns tree structure directly (with `children`)
          const tree = (await get_system_menu_list(
            {},
          )) as unknown as get_system_menu_list_response['data'][];
          return tree;
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
    treeConfig: {
      parentField: 'pid',
      rowField: 'id',
      // accept tree data; enable transform for built-in support if flat
      // transform: true,
    },
  } as VxeTableGridOptions,
});

// const accessStore = useAccessStore();

function extractComponentKey(route: RouteRecordRaw): string | undefined {
  const c: any = (route as any).component;
  let key: string | undefined;
  if (c && typeof c === 'function') {
    const s = String(c);
    const m = s.match(/import\(\s*(?:\/\*[\s\S]*?\*\/\s*)?(['"`])([^'"`]+)\1/);
    if (m) {
      const p0 = m[2];
      if (p0) {
        let p = p0;
        if (p.startsWith('#/views/')) p = p.replace('#/views/', '/');
        else if (p.startsWith('@/views/')) p = p.replace('@/views/', '/');
        else if (p.startsWith('/src/views/')) p = p.replace('/src/views/', '/');
        if (p.endsWith('.vue')) p = p.slice(0, -4);
        if (componentKeys.includes(p)) key = p;
      }
    }
  }
  if (!key) {
    const path = String((route as any)?.path || '').replace(/\/$/, '');
    if (path) {
      const candidate = `${path}/index`;
      if (componentKeys.includes(candidate)) key = candidate;
    }
  }
  return key;
}

function routeToMenuItem(route: RouteRecordRaw): any {
  const children = Array.isArray(route.children)
    ? route.children.filter(Boolean)
    : [];

  const isCatalog = children.length > 0 && !route.component;
  const isLink = Boolean(
    (route.meta as any)?.isLink || (route.meta as any)?.link,
  );

  // eslint-disable-next-line unicorn/no-nested-ternary
  const type = isLink ? 'link' : isCatalog ? 'catalog' : 'menu';

  const meta = {
    title: (route.meta as any)?.title ?? String(route.name ?? route.path ?? ''),
    icon: (route.meta as any)?.icon,
    hideInMenu: (route.meta as any)?.hideInMenu ?? false,
    hideInBreadcrumb: (route.meta as any)?.hideInBreadcrumb ?? false,
    hideChildrenInMenu: (route.meta as any)?.hideChildrenInMenu ?? false,
    affixTab: (route.meta as any)?.affixTab ?? false,
    keepAlive: (route.meta as any)?.keepAlive ?? false,
    badge: (route.meta as any)?.badge,
    badgeType: (route.meta as any)?.badgeType,
    badgeVariants: (route.meta as any)?.badgeVariants,
  };

  const item: any = {
    // 后端唯一字段：name、path
    name: String(route.name ?? route.path ?? ''),
    path: String(route.path ?? ''),
    // 可选字段
    component: type === 'menu' ? extractComponentKey(route) : undefined,
    redirect: (route as any)?.redirect,
    type,
    authCode: null,
    pid: null,
    status: 1,
    meta,
    children: children.map((r) => routeToMenuItem(r)),
  };

  return item;
}

function routesToSyncMenus(routes: RouteRecordRaw[]): any[] {
  // 过滤根路由和404兜底路由等无需出现在菜单中的项
  const filtered = routes.filter((r) => {
    const name = String(r.name ?? '');
    const path = String(r.path ?? '');
    const hideInMenu = (r.meta as any)?.hideInMenu === true;
    // 排除根 '/'、404 以及显式隐藏的菜单
    if (path === '/' || name === 'FallbackNotFound' || hideInMenu) return false;
    return true;
  });
  return filtered.map((r) => routeToMenuItem(r));
}

function onActionClick({
  code,
  row,
}: OnActionClickParams<get_system_menu_list_response['data']>) {
  switch (code) {
    case 'append': {
      onAppend(row);
      break;
    }
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
    default: {
      break;
    }
  }
}

async function onStatusChange(newStatus: number, row: any) {
  const status = { 0: '禁用', 1: '启用' } as const;
  try {
    await new Promise((resolve, reject) => {
      Modal.confirm({
        title: '切换状态',
        content: `你要将${row.name}的状态切换为 【${status[newStatus as 0 | 1]}】 吗？`,
        onOk: () => resolve(true),
        onCancel: () => reject(new Error('已取消')),
      });
    });
    await patch_system_menu_id({ id: row.id, body: { status: newStatus } });
    return true;
  } catch {
    return false;
  }
}

function onRefresh() {
  gridApi.query();
}
function onEdit(row: get_system_menu_list_response['data']) {
  formDrawerApi.setData(row).open();
}
function onCreate() {
  formDrawerApi.setData({}).open();
}
function onAppend(row: get_system_menu_list_response['data']) {
  formDrawerApi.setData({ pid: row.id }).open();
}
function onDelete(row: get_system_menu_list_response['data']) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  delete_system_menu_id({ id: row.id })
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

function onSync() {
  Modal.confirm({
    title: $t('system.menu.syncConfirmTitle') || '同步菜单',
    content:
      $t('system.menu.syncConfirmContent') ||
      '确定要同步菜单吗？此操作将更新所有菜单数据。',
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk() {
      // 使用项目静态路由（全部菜单）生成同步数据
      return Promise.resolve()
        .then(async () => {
          const routes = accessRoutes;
          const menus = routesToSyncMenus(routes);
          await post_system_menu_sync(
            { body: { menus } },
            { successMessage: true },
          );

          onRefresh();
        })
        .catch((error) => {
          message.error({
            content:
              error?.message || $t('system.menu.syncFailed') || '菜单同步失败',
            key: 'sync_process_msg',
          });
          console.error('菜单同步失败:', error);
        });
    },
  });
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.menu.name')]) }}
        </Button>
        <Button type="default" @click="onSync" class="ml-2">
          <IconifyIcon icon="carbon:renew" class="size-5" />
          {{ $t('system.menu.sync') || '同步菜单' }}
        </Button>
      </template>
      <template #title="{ row }">
        <div class="flex w-full items-center gap-1">
          <div class="size-5 flex-shrink-0">
            <IconifyIcon
              v-if="row.type === 'button'"
              icon="carbon:security"
              class="size-full"
            />
            <IconifyIcon
              v-else-if="row.meta?.icon"
              :icon="row.meta?.icon || 'carbon:circle-dash'"
              class="size-full"
            />
          </div>
          <span class="flex-auto">{{ $t(row.meta?.title) }}</span>
          <div class="items-center justify-end"></div>
        </div>
        <MenuBadge
          v-if="row.meta?.badgeType"
          class="menu-badge"
          :badge="row.meta.badge"
          :badge-type="row.meta.badgeType"
          :badge-variants="row.meta.badgeVariants"
        />
      </template>
    </Grid>
  </Page>
</template>
<style lang="scss" scoped>
.menu-badge {
  top: 50%;
  right: 0;
  transform: translateY(-50%);

  & > :deep(div) {
    padding-top: 0;
    padding-bottom: 0;
  }
}
</style>
