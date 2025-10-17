import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 用户登录 DTO
 *
 * 定义用户登录时需要提供的数据结构
 * 包含用户名和密码字段的验证规则
 */
export class LoginDto {
  @ApiProperty({
    description: '用户密码',
    example: '123456',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: '用户名，用于登录认证',
    example: 'admin',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  username: string;
}
