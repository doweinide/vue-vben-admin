export class ResponseDto<T = any> {
  code: number;
  data?: T;
  message: string;
  timestamp: string;

  constructor(code: number, message: string, data?: T) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static error(code: number, message: string): ResponseDto {
    return new ResponseDto(code, message);
  }

  static success<T>(data?: T, message = 'Success'): ResponseDto<T> {
    return new ResponseDto(200, message, data);
  }
}
