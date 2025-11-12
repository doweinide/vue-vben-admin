import type {
  get_test_validation_id_request,
  get_test_validation_id_response,
  get_test_validation_request,
  get_test_validation_response,
  post_test_validation_id_request,
  post_test_validation_id_response,
  post_test_validation_request,
  post_test_validation_response,
} from './types';

import { request } from '#/api/request';

/**
 * 测试获取列表
 * 测试 Query 参数的自动验证
 */
export const get_test_validation = async (
  params: get_test_validation_request,
  config?: any,
): Promise<get_test_validation_response['data']> => {
  const response = await request<get_test_validation_response['data']>({
    url: '/api/test-validation',
    method: 'GET',
    params,
    ...config,
  });
  return response;
};

/**
 * 测试创建
 * 测试 Body 参数的自动验证
 */
export const post_test_validation = async (
  params: post_test_validation_request,
  config?: any,
): Promise<post_test_validation_response['data']> => {
  const response = await request<post_test_validation_response['data']>({
    url: '/api/test-validation',
    method: 'POST',
    data: params.body,
    ...config,
  });
  return response;
};

/**
 * 测试获取详情
 * 测试 Param 参数的自动验证
 */
export const get_test_validation_id = async (
  params: get_test_validation_id_request,
  config?: any,
): Promise<get_test_validation_id_response['data']> => {
  const response = await request<get_test_validation_id_response['data']>({
    url: `/api/test-validation/${params.id}`,
    method: 'GET',
    ...config,
  });
  return response;
};

/**
 * 测试更新
 * 测试 Body + Param 参数的自动验证
 */
export const post_test_validation_id = async (
  params: post_test_validation_id_request,
  config?: any,
): Promise<post_test_validation_id_response['data']> => {
  const response = await request<post_test_validation_id_response['data']>({
    url: `/api/test-validation/${params.id}`,
    method: 'POST',
    data: params.body,
    ...config,
  });
  return response;
};
