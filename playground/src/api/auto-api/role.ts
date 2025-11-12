import type {
  delete_roles_id_request,
  delete_roles_id_response,
  get_roles_id_permissions_request,
  get_roles_id_permissions_response,
  get_roles_id_request,
  get_roles_id_response,
  get_roles_request,
  get_roles_response,
  patch_roles_id_request,
  patch_roles_id_response,
  post_roles_check_name_request,
  post_roles_check_name_response,
  post_roles_id_permissions_request,
  post_roles_id_permissions_response,
  post_roles_request,
  post_roles_response,
} from './types';

import { request } from '#/api/request';

/**
 * 获取角色权限
 * 获取角色的菜单权限列表
 */
export const get_roles_id_permissions = async (
  params: get_roles_id_permissions_request,
  config?: any,
): Promise<get_roles_id_permissions_response['data']> => {
  const response = await request<get_roles_id_permissions_response['data']>({
    url: `/api/roles/${params.id}/permissions`,
    method: 'GET',
    ...config,
  });
  return response;
};

/**
 * 分配角色权限
 * 为角色分配菜单权限
 */
export const post_roles_id_permissions = async (
  params: post_roles_id_permissions_request,
  config?: any,
): Promise<post_roles_id_permissions_response['data']> => {
  const response = await request<post_roles_id_permissions_response['data']>({
    url: `/api/roles/${params.id}/permissions`,
    method: 'POST',
    data: params.body,
    ...config,
  });
  return response;
};

/**
 * 检查角色名称是否存在
 * 检查指定的角色名称是否已存在
 */
export const post_roles_check_name = async (
  params: post_roles_check_name_request,
  config?: any,
): Promise<post_roles_check_name_response['data']> => {
  const response = await request<post_roles_check_name_response['data']>({
    url: '/api/roles/check-name',
    method: 'POST',
    data: params.body,
    ...config,
  });
  return response;
};

/**
 * 获取角色列表
 * 获取角色列表，支持分页和搜索
 */
export const get_roles = async (
  params: get_roles_request,
  config?: any,
): Promise<get_roles_response['data']> => {
  const response = await request<get_roles_response['data']>({
    url: '/api/roles',
    method: 'GET',
    params,
    ...config,
  });
  return response;
};

/**
 * 创建角色
 * 创建新的角色
 */
export const post_roles = async (
  params: post_roles_request,
  config?: any,
): Promise<post_roles_response['data']> => {
  const response = await request<post_roles_response['data']>({
    url: '/api/roles',
    method: 'POST',
    data: params.body,
    ...config,
  });
  return response;
};

/**
 * 获取角色详情
 * 根据ID获取角色详情
 */
export const get_roles_id = async (
  params: get_roles_id_request,
  config?: any,
): Promise<get_roles_id_response['data']> => {
  const response = await request<get_roles_id_response['data']>({
    url: `/api/roles/${params.id}`,
    method: 'GET',
    ...config,
  });
  return response;
};

/**
 * 删除角色
 * 根据ID删除角色
 */
export const delete_roles_id = async (
  params: delete_roles_id_request,
  config?: any,
): Promise<delete_roles_id_response['data']> => {
  const response = await request<delete_roles_id_response['data']>({
    url: `/api/roles/${params.id}`,
    method: 'DELETE',
    ...config,
  });
  return response;
};

/**
 * 更新角色
 * 根据ID更新角色信息
 */
export const patch_roles_id = async (
  params: patch_roles_id_request,
  config?: any,
): Promise<patch_roles_id_response['data']> => {
  const response = await request<patch_roles_id_response['data']>({
    url: `/api/roles/${params.id}`,
    method: 'PATCH',
    data: params.body,
    ...config,
  });
  return response;
};
