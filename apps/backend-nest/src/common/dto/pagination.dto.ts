import { Transform } from 'class-transformer';
import { IsOptional, IsPositive, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Max(100)
  @Min(1)
  @Transform(({ value }) => Number.parseInt(value, 10))
  limit?: number = 10;

  @IsOptional()
  @IsPositive()
  @Min(1)
  @Transform(({ value }) => Number.parseInt(value, 10))
  page?: number = 1;
}

export class PaginationResponseDto<T> {
  data: T[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}
