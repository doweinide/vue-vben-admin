import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';

import { CreateUserDto } from './create-user.dto';

/**
 * 更新用户 DTO
 *
 * 继承自 CreateUserDto 的部分类型，所有字段都变为可选
 * 额外添加了 isActive 字段用于控制用户状态
 * 用于用户信息的部分更新操作
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  /**
   * 用户激活状态
   *
   * 可选字段，用于启用或禁用用户账户
   * true: 用户激活，可以正常使用系统
   * false: 用户被禁用，无法登录系统
   *
   * @example true
   */
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
