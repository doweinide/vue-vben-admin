/**
 * 统一响应格式 DTO
 *
 * 定义 API 响应的统一格式，确保所有接口返回的数据结构一致
 * 包含状态码、消息、数据和时间戳等信息
 *
 * @template T 响应数据的类型，默认为 any
 */
export class ResponseDto<T = any> {
  /** HTTP 状态码或业务状态码 */
  code: number;

  /** 响应数据，可选 */
  data?: T;

  /** 响应消息，用于描述操作结果 */
  message: string;

  /** 响应时间戳，ISO 8601 格式 */
  timestamp: string;

  /**
   * 构造响应对象
   *
   * @param code 状态码
   * @param message 响应消息
   * @param data 响应数据（可选）
   */
  constructor(code: number, message: string, data?: T) {
    this.code = code;
    this.message = message;
    this.data = data;
    // 设置当前时间戳
    this.timestamp = new Date().toISOString();
  }

  /**
   * 创建错误响应
   *
   * @param code 错误状态码
   * @param message 错误消息
   * @returns 错误响应对象
   *
   * @example
   * ResponseDto.error(400, '参数错误')
   */
  static error(code: number, message: string): ResponseDto {
    return new ResponseDto(code, message);
  }

  /**
   * 创建成功响应
   *
   * @param data 响应数据（可选）
   * @param message 成功消息，默认为 'Success'
   * @returns 成功响应对象
   *
   * @example
   * ResponseDto.success(userData, '获取用户信息成功')
   * ResponseDto.success() // 无数据的成功响应
   */
  static success<T>(data?: T, message = 'Success'): ResponseDto<T> {
    return new ResponseDto(200, message, data);
  }
}
