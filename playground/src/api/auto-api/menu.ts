import type {
  delete_system_menu_id_request,
  delete_system_menu_id_response,
  get_system_menu_id_request,
  get_system_menu_id_response,
  get_system_menu_list_request,
  get_system_menu_list_response,
  get_system_menu_name_exists_request,
  get_system_menu_name_exists_response,
  get_system_menu_path_exists_request,
  get_system_menu_path_exists_response,
  patch_system_menu_id_request,
  patch_system_menu_id_response,
  post_system_menu_request,
  post_system_menu_response,
  post_system_menu_sync_request,
  post_system_menu_sync_response,
} from './types';

import { request } from '#/api/request';

/**
 * 创建菜单
 * 创建新的菜单项
 */
export const post_system_menu = async (
  params: post_system_menu_request,
  config?: any,
): Promise<post_system_menu_response['data']> => {
  const response = await request<post_system_menu_response['data']>({
    url: '/api/system/menu',
    method: 'POST',
    data: params.body,
    ...config,
  });
  return response;
};

/**
 * 获取菜单列表
 * 获取菜单列表，支持筛选条件
 */
export const get_system_menu_list = async (
  params: get_system_menu_list_request,
  config?: any,
): Promise<get_system_menu_list_response['data']> => {
  const response = await request<get_system_menu_list_response['data']>({
    url: '/api/system/menu/list',
    method: 'GET',
    params: params.params,
    ...config,
  });
  return response;
};

/**
 * 获取菜单详情
 * 根据ID获取菜单详情
 */
export const get_system_menu_id = async (
  params: get_system_menu_id_request,
  config?: any,
): Promise<get_system_menu_id_response['data']> => {
  const response = await request<get_system_menu_id_response['data']>({
    url: `/api/system/menu/${params.id}`,
    method: 'GET',
    ...config,
  });
  return response;
};

/**
 * 删除菜单
 * 删除指定ID的菜单
 */
export const delete_system_menu_id = async (
  params: delete_system_menu_id_request,
  config?: any,
): Promise<delete_system_menu_id_response['data']> => {
  const response = await request<delete_system_menu_id_response['data']>({
    url: `/api/system/menu/${params.id}`,
    method: 'DELETE',
    ...config,
  });
  return response;
};

/**
 * 更新菜单
 * 根据ID更新菜单信息
 */
export const patch_system_menu_id = async (
  params: patch_system_menu_id_request,
  config?: any,
): Promise<patch_system_menu_id_response['data']> => {
  const response = await request<patch_system_menu_id_response['data']>({
    url: `/api/system/menu/${params.id}`,
    method: 'PATCH',
    data: params.body,
    ...config,
  });
  return response;
};

/**
 * 检查菜单名称是否存在
 * 检查菜单名称是否已存在
 */
export const get_system_menu_name_exists = async (
  params: get_system_menu_name_exists_request,
  config?: any,
): Promise<get_system_menu_name_exists_response['data']> => {
  const response = await request<get_system_menu_name_exists_response['data']>({
    url: '/api/system/menu/name-exists',
    method: 'GET',
    params: params.params,
    ...config,
  });
  return response;
};

/**
 * 检查菜单路径是否存在
 * 检查菜单路径是否已存在
 */
export const get_system_menu_path_exists = async (
  params: get_system_menu_path_exists_request,
  config?: any,
): Promise<get_system_menu_path_exists_response['data']> => {
  const response = await request<get_system_menu_path_exists_response['data']>({
    url: '/api/system/menu/path-exists',
    method: 'GET',
    params: params.params,
    ...config,
  });
  return response;
};

/**
 * 批量同步菜单（智能同步）
 * 一次性同步菜单：只更新变化、新增不存在、删除未提供（保留按钮）
 */
export const post_system_menu_sync = async (
  params: post_system_menu_sync_request,
  config?: any,
): Promise<post_system_menu_sync_response['data']> => {
  const response = await request<post_system_menu_sync_response['data']>({
    url: '/api/system/menu/sync',
    method: 'POST',
    data: params.body,
    ...config,
  });
  return response;
};
