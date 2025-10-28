import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 响应格式拦截器
 *
 * 该拦截器在方法执行后对响应数据进行格式化：
 * 1. 检查响应数据是否符合三段式格式（包含 code、message、data 字段）
 * 2. 如果不符合三段式格式，则自动封装为标准格式
 * 3. 确保所有 API 响应都遵循统一的三段式规范
 *
 * 三段式格式：
 * {
 *   code: number,    // 状态码
 *   message: string, // 响应消息
 *   data: any        // 响应数据
 * }
 */
@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // 如果响应为空或 undefined，返回标准格式
        if (data === null || data === undefined) {
          return {
            code: 200,
            message: 'success',
            data: null,
          };
        }

        // 检查是否已经是三段式格式
        if (this.isThreeSegmentFormat(data)) {
          return data;
        }

        // 如果不是三段式格式，则封装为标准格式
        return {
          code: 200,
          message: 'success',
          data,
        };
      }),
    );
  }

  /**
   * 检查数据是否符合三段式格式
   * @param data 响应数据
   * @returns 是否符合三段式格式
   */
  private isThreeSegmentFormat(data: any): boolean {
    // 检查是否为对象
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    // 检查是否包含必要的字段
    const hasCode = 'code' in data && typeof data.code === 'number';
    const hasMessage = 'message' in data && typeof data.message === 'string';
    const hasData = 'data' in data;

    return hasCode && hasMessage && hasData;
  }
}
