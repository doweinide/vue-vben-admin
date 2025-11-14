import type {
  get__response,
  get_health_response,
  post_upload_chunk_init_request,
  post_upload_chunk_init_response,
  post_upload_chunk_merge_request,
  post_upload_chunk_merge_response,
  post_upload_chunk_upload_request,
  post_upload_chunk_upload_response,
  post_upload_request,
  post_upload_response,
} from './types';

import { request } from '#/api/request';

/**
 * 健康检查
 * 检查应用程序运行状态，返回服务状态、时间戳和运行时间
 */
export const get_health = async (
  config?: any,
): Promise<get_health_response['data']> => {
  const response = await request<get_health_response['data']>({
    url: '/api/health',
    method: 'GET',
    ...config,
  });
  return response;
};

/**
 * 欢迎信息
 * 应用程序根路径接口，返回欢迎信息
 */
export const get_ = async (config?: any): Promise<get__response['data']> => {
  const response = await request<get__response['data']>({
    url: '/api',
    method: 'GET',
    ...config,
  });
  return response;
};

/**
 * 分片上传初始化
 * 返回缺失分片索引
 */
export const post_upload_chunk_init = async (
  params: post_upload_chunk_init_request,
  config?: any,
): Promise<post_upload_chunk_init_response['data']> => {
  const response = await request<post_upload_chunk_init_response['data']>({
    url: '/api/upload/chunk/init',
    method: 'POST',
    data: params.body,
    ...config,
  });
  return response;
};

/**
 * 合并分片
 * 合并已上传分片为完整文件
 */
export const post_upload_chunk_merge = async (
  params: post_upload_chunk_merge_request,
  config?: any,
): Promise<post_upload_chunk_merge_response['data']> => {
  const response = await request<post_upload_chunk_merge_response['data']>({
    url: '/api/upload/chunk/merge',
    method: 'POST',
    data: params.body,
    ...config,
  });
  return response;
};

/**
 * 文件上传
 * 支持单文件与多文件上传，按类型分类保存，返回可访问 URL
 */
export const post_upload = async (
  params: post_upload_request,
  config?: any,
): Promise<post_upload_response['data']> => {
  const response = await request<post_upload_response['data']>({
    url: '/api/upload',
    method: 'POST',
    params: params.params,
    data: params.body,
    ...config,
  });
  return response;
};

/**
 * 上传分片
 * 上传单个分片
 */
export const post_upload_chunk_upload = async (
  params: post_upload_chunk_upload_request,
  config?: any,
): Promise<post_upload_chunk_upload_response['data']> => {
  const response = await request<post_upload_chunk_upload_response['data']>({
    url: '/api/upload/chunk/upload',
    method: 'POST',
    params: params.params,
    data: params.body,
    ...config,
  });
  return response;
};
