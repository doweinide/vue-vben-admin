import type { VbenFormSchema } from '#/adapter/form';

import { z } from '#/adapter/form';
import { $t } from '#/locales';
import { useSystemStore } from '#/store/system';

/**
 * 获取编辑表单的字段配置
 */
export function useSchema(): VbenFormSchema[] {
  const systemStore = useSystemStore();
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.user.username'),
      rules: z
        .string()
        .min(3, $t('ui.formRules.minLength', [$t('system.user.username'), 3]))
        .max(
          20,
          $t('ui.formRules.maxLength', [$t('system.user.username'), 20]),
        ),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('system.user.email'),
      rules: z.string().email($t('ui.formRules.invalidEmail')),
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.user.realName'),
      rules: z
        .string()
        .min(2, $t('ui.formRules.minLength', [$t('system.user.realName'), 2]))
        .max(20, $t('ui.formRules.maxLength', [$t('system.user.realName'), 20]))
        .optional(),
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: $t('system.user.password'),
      rules: z
        .string()
        .min(6, $t('ui.formRules.minLength', [$t('system.user.password'), 6]))
        .max(
          20,
          $t('ui.formRules.maxLength', [$t('system.user.password'), 20]),
        ),
      componentProps: {
        visibilityToggle: true,
      },
    },
    {
      component: 'ApiTreeSelect',
      fieldName: 'deptId',
      label: $t('system.user.department'),
      componentProps: {
        allowClear: true,
        api: async () => {
          await systemStore.fetchDepartments();
          return systemStore.departments;
        },
        class: 'w-full',
        labelField: 'name',
        valueField: 'id',
        childrenField: 'children',
      },
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('system.user.status'),
    },
    {
      component: 'Textarea',
      componentProps: {
        maxLength: 200,
        rows: 3,
        showCount: true,
      },
      fieldName: 'remark',
      label: $t('system.user.remark'),
      rules: z
        .string()
        .max(200, $t('ui.formRules.maxLength', [$t('system.user.remark'), 200]))
        .optional(),
    },
  ];
}

/**
 * 获取表格列配置
 */
export function useColumns(onActionClick?: any): any[] {
  return [
    {
      align: 'left',
      field: 'username',
      fixed: 'left',
      title: $t('system.user.username'),
      width: 120,
    },
    {
      field: 'name',
      title: $t('system.user.realName'),
      width: 120,
    },
    {
      field: 'email',
      title: $t('system.user.email'),
      width: 200,
    },
    {
      field: 'department.name',
      title: $t('system.user.department'),
      width: 150,
    },
    {
      cellRender: { name: 'CellTag' },
      field: 'status',
      title: $t('system.user.status'),
      width: 100,
    },
    {
      field: 'createdAt',
      title: $t('system.user.createTime'),
      width: 180,
    },
    {
      align: 'right',
      cellRender: {
        attrs: {
          nameField: 'username',
          nameTitle: $t('system.user.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['edit', 'delete'],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('system.user.operation'),
      width: 150,
    },
  ];
}
