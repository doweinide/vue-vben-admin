import type {
  delete_users_id_request,
  delete_users_id_response,
  get_users_id_request,
  get_users_id_response,
  get_users_request,
  get_users_response,
  patch_users_id_request,
  patch_users_id_response,
  post_users_request,
  post_users_response,
} from './types';

import { request } from '#/api/request';

/**
 * 获取用户列表
 * 支持分页查询，返回用户基本信息（不包含密码）
 */
export const get_users = async (
  params: get_users_request,
): Promise<get_users_response['data']> => {
  const response = await request<get_users_response['data']>({
    url: '/api/users',
    method: 'GET',
    params,
  });
  return response;
};

/**
 * 创建用户
 * 创建新用户账户，公共接口允许用户注册
 */
export const post_users = async (
  params: post_users_request,
): Promise<post_users_response['data']> => {
  const response = await request<post_users_response['data']>({
    url: '/api/users',
    method: 'POST',
    data: params.body,
  });
  return response;
};

/**
 * 获取用户详情
 * 根据用户ID获取用户详细信息，需要认证
 */
export const get_users_id = async (
  params: get_users_id_request,
): Promise<get_users_id_response['data']> => {
  const response = await request<get_users_id_response['data']>({
    url: `/api/users/${params.id}`,
    method: 'GET',
  });
  return response;
};

/**
 * 删除用户
 * 删除指定用户，需要认证和管理员权限
 */
export const delete_users_id = async (
  params: delete_users_id_request,
): Promise<delete_users_id_response['data']> => {
  const response = await request<delete_users_id_response['data']>({
    url: `/api/users/${params.id}`,
    method: 'DELETE',
  });
  return response;
};

/**
 * 更新用户信息
 * 更新指定用户的信息，需要认证
 */
export const patch_users_id = async (
  params: patch_users_id_request,
): Promise<patch_users_id_response['data']> => {
  const response = await request<patch_users_id_response['data']>({
    url: `/api/users/${params.id}`,
    method: 'PATCH',
    data: params.body,
  });
  return response;
};
