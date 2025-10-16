import { Transform } from 'class-transformer';
import { IsOptional, IsPositive, Max, Min } from 'class-validator';

/**
 * 分页查询 DTO
 *
 * 用于接收和验证分页查询参数
 * 支持 limit（每页数量）和 page（页码）参数
 */
export class PaginationDto {
  /**
   * 每页数据数量
   *
   * 限制：
   * - 可选参数，默认值为 10
   * - 必须为正整数
   * - 最小值：1
   * - 最大值：100（防止单次查询数据过多）
   *
   * @example ?limit=20
   */
  @IsOptional()
  @IsPositive()
  @Max(100)
  @Min(1)
  @Transform(({ value }) => Number.parseInt(value, 10))
  limit?: number = 10;

  /**
   * 页码
   *
   * 限制：
   * - 可选参数，默认值为 1
   * - 必须为正整数
   * - 最小值：1
   *
   * @example ?page=2
   */
  @IsOptional()
  @IsPositive()
  @Min(1)
  @Transform(({ value }) => Number.parseInt(value, 10))
  page?: number = 1;
}

/**
 * 分页响应 DTO
 *
 * 统一的分页响应格式，包含数据和分页信息
 *
 * @template T 数据项的类型
 */
export class PaginationResponseDto<T> {
  /** 当前页的数据列表 */
  data: T[];

  /** 每页数据数量 */
  limit: number;

  /** 当前页码 */
  page: number;

  /** 数据总数 */
  total: number;

  /** 总页数 */
  totalPages: number;

  /**
   * 构造分页响应对象
   *
   * @param data 当前页的数据列表
   * @param total 数据总数
   * @param page 当前页码
   * @param limit 每页数据数量
   */
  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    // 计算总页数，向上取整
    this.totalPages = Math.ceil(total / limit);
  }
}
