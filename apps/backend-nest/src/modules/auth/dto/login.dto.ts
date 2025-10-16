import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 用户登录 DTO
 *
 * 定义用户登录时需要提供的数据结构
 * 包含用户名和密码字段的验证规则
 */
export class LoginDto {
  /**
   * 用户密码
   *
   * 验证规则：
   * - 不能为空
   * - 必须是字符串类型
   *
   * @example "123456"
   */
  @IsNotEmpty()
  @IsString()
  password: string;

  /**
   * 用户名
   *
   * 验证规则：
   * - 不能为空
   * - 必须是字符串类型
   *
   * @example "admin"
   */
  @IsNotEmpty()
  @IsString()
  username: string;
}
