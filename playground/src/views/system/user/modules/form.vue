<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { $t } from '#/locales';
import { useSystemStore } from '#/store/system';

import { useSchema } from '../data';

const emit = defineEmits(['success']);
const systemStore = useSystemStore();
const formData = ref<any>();
const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.user.name')])
    : $t('ui.actionTitle.create', [$t('system.user.name')]);
});

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useSchema(),
  showDefaultActions: false,
});

function resetForm() {
  formApi.resetForm();
  const initial = { ...formData.value } as any;
  if (Array.isArray(initial.userRoles)) {
    initial.roleIds = initial.userRoles
      .map((ur: any) => ur?.roleId)
      .filter(Boolean);
  }
  formApi.setValues(initial);
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      const createPayload = {
        avatar: data.avatar as string | undefined,
        deptId: data.deptId as string | undefined,
        email: data.email as string,
        name: data.name as string | undefined,
        password: data.password as string,
        status: data.status as number | undefined,
        username: data.username as string,
        roleIds: (data.roleIds as string[] | undefined) ?? undefined,
      } as {
        avatar?: string;
        deptId?: string;
        email: string;
        name?: string;
        password: string;
        roleIds?: string[];
        status?: number;
        username: string;
      };
      const updatePayload = {
        avatar: data.avatar as string | undefined,
        deptId: data.deptId as string | undefined,
        email: data.email as string | undefined,
        name: data.name as string | undefined,
        status: data.status as number | undefined,
        username: data.username as string | undefined,
        roleIds: (data.roleIds as string[] | undefined) ?? undefined,
      } as {
        avatar?: string;
        deptId?: string;
        email?: string;
        name?: string;
        roleIds?: string[];
        status?: number;
        username?: string;
      };
      try {
        await (formData.value?.id
          ? systemStore.updateUser(formData.value.id, updatePayload)
          : systemStore.createUser(createPayload));
        modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<any>();
      if (data) {
        formData.value = data;
        const initial = { ...formData.value } as any;
        if (Array.isArray(initial.userRoles)) {
          initial.roleIds = initial.userRoles
            .map((ur: any) => ur?.roleId)
            .filter(Boolean);
        }
        formApi.setValues(initial);
      }
    }
  },
});
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4" />
    <template #prepend-footer>
      <div class="flex-auto">
        <Button type="primary" danger @click="resetForm">
          {{ $t('common.reset') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>
