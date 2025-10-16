import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

/**
 * 创建用户 DTO
 *
 * 定义创建用户时需要提供的数据结构和验证规则
 * 包含用户的基本信息和角色权限
 */
export class CreateUserDto {
  /**
   * 用户头像 URL
   *
   * 可选字段，用于存储用户头像的链接地址
   *
   * @example "https://example.com/avatar.jpg"
   */
  @IsOptional()
  @IsString()
  avatar?: string;

  /**
   * 用户邮箱
   *
   * 必填字段，必须是有效的邮箱格式
   * 在系统中具有唯一性
   *
   * @example "user@example.com"
   */
  @IsEmail()
  email: string;

  /**
   * 用户密码
   *
   * 必填字段，最少 6 位字符
   * 存储时会使用 bcrypt 进行加密
   *
   * @example "123456"
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  /**
   * 用户角色列表
   *
   * 可选字段，默认为 ['user']
   * 用于权限控制和功能访问限制
   *
   * @example ["user", "admin"]
   */
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  roles?: string[];

  /**
   * 用户名
   *
   * 必填字段，用于登录和用户标识
   * 在系统中具有唯一性
   *
   * @example "admin"
   */
  @IsNotEmpty()
  @IsString()
  username: string;
}
