<script lang="ts" setup>
import type { DataNode } from 'ant-design-vue/es/tree';

import type { Recordable } from '@vben/types';

import type { get_system_menu_list_response } from '#/api/auto-api/types';

import { computed, nextTick, ref } from 'vue';

import { Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Spin } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { get_system_menu_list } from '#/api/auto-api/menu';
import { $t } from '#/locales';
import { useSystemStore } from '#/store/system';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);
const systemStore = useSystemStore();

const formData = ref<any>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const permissions = ref<DataNode[]>([]);
const loadingPermissions = ref(false);

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const payload = {
      name: values.name as string,
      remark: values.remark as string | undefined,
      status: values.status as number | undefined,
    } as { name: string; remark?: string; status?: number };
    // Extract selected permission menu IDs from form values
    const selectedMenuIds: string[] = Array.isArray(values.permissions)
      ? (values.permissions as string[])
      : [];
    drawerApi.lock();
    try {
      let roleId = id.value as string | undefined;
      if (id.value) {
        await systemStore.updateRole(id.value, payload);
      } else {
        const created = await systemStore.createRole(payload);
        // The create API returns role data including id
        roleId = (created as any)?.id ?? roleId;
      }
      // Assign permissions if we have a role id
      if (roleId) {
        await systemStore.assignRolePermissions(roleId, selectedMenuIds);
      }
      emits('success');
      drawerApi.close();
    } catch {
      drawerApi.unlock();
    }
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<any>();
      formApi.resetForm();

      if (data) {
        formData.value = data;
        id.value = data.id;
      } else {
        id.value = undefined;
      }

      if (permissions.value.length === 0) {
        await loadPermissions();
      }
      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (data) {
        formApi.setValues(data);
        // Prefill selected permissions from rolePermissions
        const presetMenuIds: string[] = Array.isArray(data.rolePermissions)
          ? (data.rolePermissions
              .map((rp: any) => rp?.menuId)
              .filter(Boolean) as string[])
          : [];
        formApi.setValues({ permissions: presetMenuIds });
      } else {
        // Ensure permissions field starts as empty array for create
        formApi.setValues({ permissions: [] });
      }
    }
  },
});

async function loadPermissions() {
  loadingPermissions.value = true;
  try {
    const list = (await get_system_menu_list(
      {},
    )) as unknown as get_system_menu_list_response['data'][];
    // Build tree from flat list using pid
    const map = new Map<string, any>();
    const roots: any[] = [];
    for (const item of list) {
      map.set(item.id, { ...item, children: [] });
    }
    for (const item of list) {
      const node = map.get(item.id);
      const pid = item.pid;
      if (pid && map.has(pid)) {
        map.get(pid).children.push(node);
      } else {
        roots.push(node);
      }
    }
    permissions.value = roots as unknown as DataNode[];
  } finally {
    loadingPermissions.value = false;
  }
}

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.role.name'))
    : $t('common.create', $t('system.role.name'));
});

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.type === 'button') {
    classes.push('inline-flex');
  }

  return classes.join(' ');
}
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form>
      <template #permissions="slotProps">
        <Spin :spinning="loadingPermissions" wrapper-class-name="w-full">
          <Tree
            :tree-data="permissions"
            multiple
            bordered
            :default-expanded-level="2"
            :get-node-class="getNodeClass"
            v-bind="slotProps"
            value-field="id"
            label-field="meta.title"
            icon-field="meta.icon"
          >
            <template #node="{ value }">
              <IconifyIcon v-if="value.meta.icon" :icon="value.meta.icon" />
              {{ $t(value.meta.title) }}
            </template>
          </Tree>
        </Spin>
      </template>
    </Form>
  </Drawer>
</template>
<style lang="css" scoped>
:deep(.ant-tree-title) {
  .tree-actions {
    display: none;
    margin-left: 20px;
  }
}

:deep(.ant-tree-title:hover) {
  .tree-actions {
    display: flex;
    flex: auto;
    justify-content: flex-end;
    margin-left: 20px;
  }
}
</style>
