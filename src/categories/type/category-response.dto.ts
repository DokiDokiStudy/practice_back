import { ApiProperty } from '@nestjs/swagger';

export class CategoryCreateResponseDto {
  @ApiProperty({ example: 'docker', description: '생성된 카테고리 이름' })
  name: string;
}

export class CategoryChildDto {
  @ApiProperty({ example: 8, description: '카테고리 ID' })
  id: number;

  @ApiProperty({ example: '공지사항', description: '카테고리 이름' })
  name: string;

  @ApiProperty({
    type: [CategoryChildDto],
    description: '하위 카테고리 배열',
    example: [],
  })
  children: CategoryChildDto[];
}

export class CategoryGetResponseDto {
  @ApiProperty({ example: 8, description: '카테고리 ID' })
  id: number;

  @ApiProperty({ example: '공지사항', description: '카테고리 이름' })
  name: string;

  @ApiProperty({
    type: [CategoryChildDto],
    description: '하위 카테고리 배열',
    example: [],
  })
  children: CategoryChildDto[];
}

export class CategoryGetAllResponseDto {
  @ApiProperty({
    type: [CategoryGetResponseDto],
    description: '카테고리 배열',
    example: [
      {
        id: 8,
        name: '공지사항',
        children: [],
      },
      {
        id: 9,
        name: '자유게시판',
        children: [],
      },
      {
        id: 10,
        name: 'Docker',
        children: [],
      },
    ],
  })
  categories: CategoryGetResponseDto[];
}
