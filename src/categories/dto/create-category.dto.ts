import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: '카테고리 이름',
    example: 'docker',
  })
  @IsNotEmpty({ message: '카테고리 이름은 필수입니다.' })
  @IsString({ message: '카테고리 이름은 문자열이어야 합니다.' })
  name: string;

  @ApiProperty({
    description: '상위 카테고리 ID',
    example: 1,
    required: false,
  })
  @IsOptional({ message: '상위 카테고리 ID는 선택사항입니다.' })
  parentId?: number;
}
