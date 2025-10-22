import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import { ResponseBuilder } from '../../schemas/base.schema';

/**
 * HTTP 异常过滤器
 *
 * 全局异常处理器，用于捕获和处理应用中的所有异常
 * 将异常转换为统一的响应格式，提供更好的错误信息
 *
 * 功能：
 * - 捕获所有类型的异常
 * - 提取异常状态码和消息
 * - 返回统一格式的错误响应
 * - 处理 HttpException 和普通 Error
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * 异常处理方法
   *
   * @param exception 捕获的异常对象
   * @param host 执行上下文宿主对象
   */
  catch(exception: unknown, host: ArgumentsHost) {
    // 获取 HTTP 上下文
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 默认错误状态和消息
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorData: any;

    // 处理 HttpException 类型的异常
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // 提取异常消息
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as any;

        // 处理 Zod 验证错误（包含 data.errors 的复杂异常响应）
        if (responseObj.data && responseObj.data.errors) {
          message = responseObj.message || '请求参数验证失败';
          errorData = responseObj.data;
        } else {
          // 处理其他复杂的异常响应对象
          message = responseObj.message || exception.message;
          // 如果有其他数据，也保留
          if (responseObj.data) {
            errorData = responseObj.data;
          }
        }
      }
    } else if (exception instanceof Error) {
      // 处理普通 Error 类型的异常
      message = exception.message;
    }

    // 创建统一格式的错误响应
    const errorResponse = errorData
      ? { code: status, message, data: errorData }
      : ResponseBuilder.error(status, message);

    // 返回错误响应
    response.status(status).json(errorResponse);
  }
}
