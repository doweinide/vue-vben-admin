import type {
  get_auth_profile_response,
  post_auth_login_request,
  post_auth_login_response,
} from './types';

import { request } from '#/api/request';

/**
 * 获取当前用户信息
 * 获取当前登录用户的详细信息，需要提供有效的 JWT token
 */
export const get_auth_profile = async (
  config?: any,
): Promise<get_auth_profile_response['data']> => {
  const response = await request<get_auth_profile_response['data']>({
    url: '/api/auth/profile',
    method: 'GET',
    ...config,
  });
  return response;
};

/**
 * 用户登录
 * 用户通过用户名和密码进行登录认证，成功后返回 JWT token
 */
export const post_auth_login = async (
  params: post_auth_login_request,
  config?: any,
): Promise<post_auth_login_response['data']> => {
  const response = await request<post_auth_login_response['data']>({
    url: '/api/auth/login',
    method: 'POST',
    data: params.body,
    ...config,
  });
  return response;
};
