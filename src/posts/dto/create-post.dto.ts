import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber, ValidateIf } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    required: false,
    description: '카테고리 ID (독립 게시글인 경우 필수, 쓰레드인 경우 선택)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @ValidateIf((o) => !o.parentPostId)
  @IsNotEmpty({ message: 'categoryId 또는 parentPostId 중 하나는 필수입니다.' })
  categoryId?: number;

  @ApiProperty({
    required: false,
    description: '부모 게시글 ID (쓰레드/답글인 경우 필수)',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  @ValidateIf((o) => !o.categoryId)
  @IsNotEmpty({ message: 'categoryId 또는 parentPostId 중 하나는 필수입니다.' })
  parentPostId?: number;

  @ApiProperty({
    description: '게시글 제목',
    example: 'Docker 컨테이너 질문있습니다',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '컨테이너 실행 중 오류가 발생했는데...',
  })
  @IsNotEmpty()
  content: string;
}
