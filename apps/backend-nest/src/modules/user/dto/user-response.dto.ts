import { ApiProperty } from '@nestjs/swagger';

/**
 * 用户信息响应数据传输对象
 * 
 * 定义用户信息的标准返回格式
 * 用于所有返回用户数据的接口
 */
export class UserResponseDto {
  /**
   * 用户唯一标识符
   * 
   * @example 1
   */
  @ApiProperty({
    description: '用户唯一标识符',
    example: 1,
    type: Number,
  })
  id: number;

  /**
   * 用户名
   * 
   * @example "john_doe"
   */
  @ApiProperty({
    description: '用户名，用于登录和显示',
    example: 'john_doe',
    type: String,
  })
  username: string;

  /**
   * 邮箱地址
   * 
   * @example "john@example.com"
   */
  @ApiProperty({
    description: '用户邮箱地址',
    example: 'john@example.com',
    type: String,
  })
  email: string;

  /**
   * 头像URL
   * 
   * @example "https://example.com/avatar.jpg"
   */
  @ApiProperty({
    description: '用户头像URL',
    example: 'https://example.com/avatar.jpg',
    type: String,
    nullable: true,
    required: false,
  })
  avatar?: string;

  /**
   * 用户角色
   * 
   * @example "user"
   */
  @ApiProperty({
    description: '用户角色，如 user、admin、moderator 等',
    example: 'user',
    type: String,
  })
  roles: string;

  /**
   * 账户状态
   * 
   * @example true
   */
  @ApiProperty({
    description: '账户状态，true为激活，false为禁用',
    example: true,
    type: Boolean,
  })
  isActive: boolean;

  /**
   * 创建时间
   * 
   * @example "2023-11-01T10:30:00.000Z"
   */
  @ApiProperty({
    description: '账户创建时间',
    example: '2023-11-01T10:30:00.000Z',
    type: Date,
  })
  createdAt: Date;

  /**
   * 更新时间
   * 
   * @example "2023-11-01T10:30:00.000Z"
   */
  @ApiProperty({
    description: '账户最后更新时间',
    example: '2023-11-01T10:30:00.000Z',
    type: Date,
  })
  updatedAt: Date;
}

/**
 * 分页用户列表响应数据传输对象
 * 
 * 定义分页查询用户列表的返回格式
 */
export class PaginatedUsersResponseDto {
  /**
   * 用户列表数据
   */
  @ApiProperty({
    description: '用户列表数据',
    type: [UserResponseDto],
  })
  data: UserResponseDto[];

  /**
   * 分页信息
   */
  @ApiProperty({
    description: '分页信息',
    type: 'object',
    properties: {
      total: {
        type: 'number',
        description: '总记录数',
        example: 100,
      },
      page: {
        type: 'number',
        description: '当前页码',
        example: 1,
      },
      limit: {
        type: 'number',
        description: '每页记录数',
        example: 10,
      },
      totalPages: {
        type: 'number',
        description: '总页数',
        example: 10,
      },
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * 用户创建成功响应数据传输对象
 * 
 * 定义创建用户成功后的返回格式
 */
export class CreateUserResponseDto extends UserResponseDto {
  /**
   * 创建成功消息
   */
  @ApiProperty({
    description: '创建成功消息',
    example: '用户创建成功',
    type: String,
  })
  message: string;
}

/**
 * 用户更新成功响应数据传输对象
 * 
 * 定义更新用户成功后的返回格式
 */
export class UpdateUserResponseDto extends UserResponseDto {
  /**
   * 更新成功消息
   */
  @ApiProperty({
    description: '更新成功消息',
    example: '用户信息更新成功',
    type: String,
  })
  message: string;
}

/**
 * 用户删除成功响应数据传输对象
 * 
 * 定义删除用户成功后的返回格式
 */
export class DeleteUserResponseDto {
  /**
   * 删除成功消息
   */
  @ApiProperty({
    description: '删除成功消息',
    example: '用户删除成功',
    type: String,
  })
  message: string;

  /**
   * 被删除的用户ID
   */
  @ApiProperty({
    description: '被删除的用户ID',
    example: 1,
    type: Number,
  })
  deletedId: number;
}