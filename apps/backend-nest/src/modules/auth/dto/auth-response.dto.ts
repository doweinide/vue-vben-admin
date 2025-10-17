import { ApiProperty } from '@nestjs/swagger';

/**
 * 登录响应数据传输对象
 *
 * 定义用户登录成功后返回的数据结构
 * 包含访问令牌和用户基本信息
 */
export class LoginResponseDto {
  /**
   * JWT 访问令牌
   *
   * 用于后续 API 请求的身份验证
   * 需要在请求头中携带: Authorization: Bearer <token>
   *
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  @ApiProperty({
    description: 'JWT 访问令牌，用于身份验证',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE2OTg4MjQ0MDAsImV4cCI6MTY5ODkxMDgwMH0.abc123',
    type: String,
  })
  access_token: string;

  /**
   * 用户基本信息
   *
   * 登录成功后返回的用户信息
   * 不包含敏感信息如密码
   */
  @ApiProperty({
    description: '用户基本信息',
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: '用户ID',
        example: 1,
      },
      username: {
        type: 'string',
        description: '用户名',
        example: 'admin',
      },
      email: {
        type: 'string',
        description: '邮箱地址',
        example: 'admin@example.com',
      },
      avatar: {
        type: 'string',
        description: '头像URL',
        example: 'https://example.com/avatar.jpg',
        nullable: true,
      },
      roles: {
        type: 'string',
        description: '用户角色',
        example: 'admin',
      },
      isActive: {
        type: 'boolean',
        description: '账户状态',
        example: true,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: '创建时间',
        example: '2023-11-01T10:30:00.000Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: '更新时间',
        example: '2023-11-01T10:30:00.000Z',
      },
    },
  })
  user: {
    avatar?: string;
    createdAt: Date;
    email: string;
    id: number;
    isActive: boolean;
    roles: string;
    updatedAt: Date;
    username: string;
  };
}

/**
 * 用户信息响应数据传输对象
 *
 * 定义获取用户信息接口返回的数据结构
 * 用于 /auth/profile 接口
 */
export class ProfileResponseDto {
  /**
   * 头像URL
   *
   * @example "https://example.com/avatar.jpg"
   */
  @ApiProperty({
    description: '头像URL',
    example: 'https://example.com/avatar.jpg',
    type: String,
    nullable: true,
    required: false,
  })
  avatar?: string;

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
   * 邮箱地址
   *
   * @example "admin@example.com"
   */
  @ApiProperty({
    description: '邮箱地址',
    example: 'admin@example.com',
    type: String,
  })
  email: string;

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
   * 用户角色
   *
   * @example "admin"
   */
  @ApiProperty({
    description: '用户角色',
    example: 'admin',
    type: String,
  })
  roles: string;

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

  /**
   * 用户名
   *
   * @example "admin"
   */
  @ApiProperty({
    description: '用户名',
    example: 'admin',
    type: String,
  })
  username: string;
}
