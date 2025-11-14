import type {
  delete_system_dept_id_request,
  delete_system_dept_id_response,
  get_system_dept_id_request,
  get_system_dept_id_response,
  get_system_dept_list_request,
  get_system_dept_list_response,
  patch_system_dept_id_request,
  patch_system_dept_id_response,
  post_system_dept_request,
  post_system_dept_response,
} from './types';

import { request } from '#/api/request';

/**
 * 创建部门
 * 创建新的部门
 */
export const post_system_dept = async (
  params: post_system_dept_request,
  config?: any,
): Promise<post_system_dept_response['data']> => {
  const response = await request<post_system_dept_response['data']>({
    url: '/api/system/dept',
    method: 'POST',
    data: params.body,
    ...config,
  });
  return response;
};

/**
 * 获取部门列表
 * 获取部门列表，支持筛选条件
 */
export const get_system_dept_list = async (
  params: get_system_dept_list_request,
  config?: any,
): Promise<get_system_dept_list_response['data']> => {
  const response = await request<get_system_dept_list_response['data']>({
    url: '/api/system/dept/list',
    method: 'GET',
    params: params.params,
    ...config,
  });
  return response;
};

/**
 * 获取部门详情
 * 根据ID获取部门详情
 */
export const get_system_dept_id = async (
  params: get_system_dept_id_request,
  config?: any,
): Promise<get_system_dept_id_response['data']> => {
  const response = await request<get_system_dept_id_response['data']>({
    url: `/api/system/dept/${params.id}`,
    method: 'GET',
    ...config,
  });
  return response;
};

/**
 * 删除部门
 * 删除指定ID的部门
 */
export const delete_system_dept_id = async (
  params: delete_system_dept_id_request,
  config?: any,
): Promise<delete_system_dept_id_response['data']> => {
  const response = await request<delete_system_dept_id_response['data']>({
    url: `/api/system/dept/${params.id}`,
    method: 'DELETE',
    ...config,
  });
  return response;
};

/**
 * 更新部门
 * 更新指定ID的部门信息
 */
export const patch_system_dept_id = async (
  params: patch_system_dept_id_request,
  config?: any,
): Promise<patch_system_dept_id_response['data']> => {
  const response = await request<patch_system_dept_id_response['data']>({
    url: `/api/system/dept/${params.id}`,
    method: 'PATCH',
    data: params.body,
    ...config,
  });
  return response;
};
