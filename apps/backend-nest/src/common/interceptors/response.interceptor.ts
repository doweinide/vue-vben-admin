import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseResponse, ResponseBuilder } from '../../schemas/base.schema';
import { ResponseDto } from '../dto';

/**
 * 响应拦截器
 *
 * 全局响应拦截器，用于统一处理所有 API 响应格式
 * 支持新的 Zod 架构和三段式返回格式
 * 确保所有接口返回的数据都符合统一的响应结构
 *
 * 功能：
 * - 自动包装控制器返回的数据为标准三段式格式
 * - 兼容现有的 ResponseDto 格式
 * - 支持新的 BaseResponse 格式
 * - 提供统一的成功响应格式
 *
 * @template T 响应数据的类型
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, BaseResponse<T> | ResponseDto<T>>
{
  /**
   * 拦截器处理方法
   *
   * @param context 执行上下文
   * @param next 调用处理器
   * @returns 包装后的响应数据流
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<BaseResponse<T> | ResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        // 如果返回的数据已经是标准三段式格式（包含 code, message, data），直接返回
        if (
          data &&
          typeof data === 'object' &&
          'code' in data &&
          'message' in data
        ) {
          return data as BaseResponse<T>;
        }

        // 如果返回的数据是 ResponseDto 格式，转换为新的三段式格式
        if (data instanceof ResponseDto) {
          return {
            code: data.code,
            message: data.message,
            data: data.data,
          } as BaseResponse<T>;
        }

        // 否则包装成统一的成功响应格式
        // 使用 ResponseBuilder 创建标准三段式响应
        return ResponseBuilder.success(data, '操作成功');
      }),
    );
  }
}
