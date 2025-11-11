import type {
  get_roles_id_response,
  get_roles_response,
  get_system_dept_id_response,
  get_system_dept_list_response,
  get_users_id_response,
  get_users_response,
} from '#/api/auto-api/types';

import { ref } from 'vue';

import { defineStore } from 'pinia';

import {
  delete_roles_id,
  delete_system_dept_id,
  delete_users_id,
  get_roles,
  get_roles_id,
  get_roles_id_permissions,
  get_system_dept_id,
  get_system_dept_list,
  get_users,
  get_users_id,
  patch_roles_id,
  patch_system_dept_id,
  patch_users_id,
  post_roles,
  post_roles_check_name,
  post_roles_id_permissions,
  post_system_dept,
  post_users,
} from '#/api/auto-api';

export const useSystemStore = defineStore('system', () => {
  // 部门管理状态
  const departments = ref<get_system_dept_list_response['data'][]>([]);
  const currentDepartment = ref<get_system_dept_id_response['data'] | null>(
    null,
  );
  const departmentLoading = ref(false);

  // 角色管理状态
  const roles = ref<get_roles_response['data'][]>([]);
  const currentRole = ref<get_roles_id_response['data'] | null>(null);
  type RolePermissionItem = NonNullable<
    get_roles_id_response['data']['rolePermissions']
  >[number];
  const rolePermissions = ref<RolePermissionItem[]>([]);
  const roleLoading = ref(false);

  // 用户管理状态
  const users = ref<get_users_response['data']['items']>([]);
  const currentUser = ref<get_users_id_response['data'] | null>(null);
  const userLoading = ref(false);

  // 部门管理方法
  async function fetchDepartments(params?: { name?: string; status?: number }) {
    departmentLoading.value = true;
    try {
      const response = await get_system_dept_list(params ?? {});
      // 接口返回为 data，不含 items，这里按数组处理以适配视图
      departments.value =
        (response as unknown as get_system_dept_list_response['data'][]) ?? [];
      return response;
    } finally {
      departmentLoading.value = false;
    }
  }

  async function fetchDepartmentDetail(id: string) {
    departmentLoading.value = true;
    try {
      const response = await get_system_dept_id({ id });
      currentDepartment.value = response;
      return response;
    } finally {
      departmentLoading.value = false;
    }
  }

  async function createDepartment(data: {
    name: string;
    pid?: string;
    remark?: string;
    status?: number;
  }) {
    departmentLoading.value = true;
    try {
      const response = await post_system_dept({ body: data });
      await fetchDepartments();
      return response;
    } finally {
      departmentLoading.value = false;
    }
  }

  async function updateDepartment(
    id: string,
    data: {
      name?: string;
      pid?: string;
      remark?: string;
      status?: number;
    },
  ) {
    departmentLoading.value = true;
    try {
      const response = await patch_system_dept_id({ id, body: data });
      await fetchDepartments();
      return response;
    } finally {
      departmentLoading.value = false;
    }
  }

  async function deleteDepartment(id: string) {
    departmentLoading.value = true;
    try {
      const response = await delete_system_dept_id({ id });
      await fetchDepartments();
      return response;
    } finally {
      departmentLoading.value = false;
    }
  }

  // 角色管理方法
  async function fetchRoles(params?: {
    limit?: number;
    name?: string;
    page?: number;
    status?: number;
  }) {
    roleLoading.value = true;
    try {
      const response = await get_roles(params ?? {});
      roles.value = (response as unknown as get_roles_response['data'][]) ?? [];
      return response;
    } finally {
      roleLoading.value = false;
    }
  }

  async function fetchRoleDetail(id: string) {
    roleLoading.value = true;
    try {
      const response = await get_roles_id({ id });
      currentRole.value = response;
      return response;
    } finally {
      roleLoading.value = false;
    }
  }

  async function fetchRolePermissions(id: string) {
    roleLoading.value = true;
    try {
      const response = await get_roles_id_permissions({ id });
      rolePermissions.value =
        (response as unknown as RolePermissionItem[]) ?? [];
      return response;
    } finally {
      roleLoading.value = false;
    }
  }

  async function createRole(data: {
    name: string;
    remark?: string;
    status?: number;
  }) {
    roleLoading.value = true;
    try {
      const response = await post_roles({ body: data });
      await fetchRoles();
      return response;
    } finally {
      roleLoading.value = false;
    }
  }

  async function updateRole(
    id: string,
    data: {
      name?: string;
      remark?: string;
      status?: number;
    },
  ) {
    roleLoading.value = true;
    try {
      const response = await patch_roles_id({ id, body: data });
      await fetchRoles();
      return response;
    } finally {
      roleLoading.value = false;
    }
  }

  async function deleteRole(id: string) {
    roleLoading.value = true;
    try {
      const response = await delete_roles_id({ id });
      await fetchRoles();
      return response;
    } finally {
      roleLoading.value = false;
    }
  }

  async function assignRolePermissions(id: string, permissions: string[]) {
    roleLoading.value = true;
    try {
      const response = await post_roles_id_permissions({
        id,
        body: { menuIds: permissions, roleId: id },
      });
      await fetchRolePermissions(id);
      return response;
    } finally {
      roleLoading.value = false;
    }
  }

  async function checkRoleNameExists(name: string) {
    const response = await post_roles_check_name({ body: { name } });
    type CheckNameResp = { exists?: boolean };
    return Boolean((response as unknown as CheckNameResp)?.exists);
  }

  // 用户管理方法
  async function fetchUsers(params?: {
    deptId?: string;
    email?: string;
    limit?: number;
    page?: number;
    status?: number;
    username?: string;
  }) {
    userLoading.value = true;
    try {
      const response = await get_users(params ?? {});
      users.value = response.items || [];
      return response;
    } finally {
      userLoading.value = false;
    }
  }

  async function fetchUserDetail(id: string) {
    userLoading.value = true;
    try {
      const response = await get_users_id({ id });
      currentUser.value = response;
      return response;
    } finally {
      userLoading.value = false;
    }
  }

  async function createUser(data: {
    avatar?: string;
    deptId?: string;
    email: string;
    name?: string;
    password: string;
    status?: number;
    username: string;
  }) {
    userLoading.value = true;
    try {
      const response = await post_users({ body: data });
      await fetchUsers();
      return response;
    } finally {
      userLoading.value = false;
    }
  }

  async function updateUser(
    id: string,
    data: {
      avatar?: string;
      deptId?: string;
      email?: string;
      name?: string;
      status?: number;
      username?: string;
    },
  ) {
    userLoading.value = true;
    try {
      const response = await patch_users_id({ id, body: data });
      await fetchUsers();
      return response;
    } finally {
      userLoading.value = false;
    }
  }

  async function deleteUser(id: string) {
    userLoading.value = true;
    try {
      const response = await delete_users_id({ id });
      await fetchUsers();
      return response;
    } finally {
      userLoading.value = false;
    }
  }

  function $reset() {
    departments.value = [];
    currentDepartment.value = null;
    departmentLoading.value = false;
    roles.value = [];
    currentRole.value = null;
    rolePermissions.value = [];
    roleLoading.value = false;
    users.value = [];
    currentUser.value = null;
    userLoading.value = false;
  }

  return {
    // 状态
    departments,
    currentDepartment,
    departmentLoading,
    roles,
    currentRole,
    rolePermissions,
    roleLoading,
    users,
    currentUser,
    userLoading,
    // 部门方法
    fetchDepartments,
    fetchDepartmentDetail,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    // 角色方法
    fetchRoles,
    fetchRoleDetail,
    fetchRolePermissions,
    createRole,
    updateRole,
    deleteRole,
    assignRolePermissions,
    checkRoleNameExists,
    // 用户方法
    fetchUsers,
    fetchUserDetail,
    createUser,
    updateUser,
    deleteUser,
    // 重置
    $reset,
  };
});
