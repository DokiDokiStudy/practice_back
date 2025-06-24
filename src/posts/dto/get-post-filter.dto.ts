import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPostsFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}
