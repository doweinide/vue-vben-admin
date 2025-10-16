import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ResponseDto } from '../dto';

/**
 * 响应拦截器
 *
 * 全局响应拦截器，用于统一处理所有 API 响应格式
 * 确保所有接口返回的数据都符合统一的响应结构
 *
 * 功能：
 * - 自动包装控制器返回的数据为 ResponseDto 格式
 * - 避免重复包装已经是 ResponseDto 格式的数据
 * - 提供统一的成功响应格式
 *
 * @template T 响应数据的类型
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
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
  ): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        // 如果返回的数据已经是 ResponseDto 格式，直接返回
        // 避免重复包装，保持原有的状态码和消息
        if (data instanceof ResponseDto) {
          return data;
        }

        // 否则包装成统一的成功响应格式
        // 使用默认的成功状态码 200 和消息 'Success'
        return ResponseDto.success(data);
      }),
    );
  }
}
