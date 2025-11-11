import type { get__response, get_health_response } from './types';

import { request } from '#/api/request';

/**
 * 健康检查
 * 检查应用程序运行状态，返回服务状态、时间戳和运行时间
 */
export const get_health = async (): Promise<get_health_response['data']> => {
  const response = await request<get_health_response['data']>({
    url: '/api/health',
    method: 'GET',
  });
  return response;
};

/**
 * 欢迎信息
 * 应用程序根路径接口，返回欢迎信息
 */
export const get_ = async (): Promise<get__response['data']> => {
  const response = await request<get__response['data']>({
    url: '/api',
    method: 'GET',
  });
  return response;
};
