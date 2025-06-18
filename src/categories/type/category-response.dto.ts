import { ApiProperty } from '@nestjs/swagger';

export class CategoryGetResponseData {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: null })
  parent: number | null;

  @ApiProperty({ example: '자유게시판' })
  name: string;

  @ApiProperty({
    example: `1 - 대분류, 2 - 중분류, 3 -  소분류`,
  })
  depth: number;
}

export class CategoryGetResponseDto {
  @ApiProperty({ example: '로그인에 성공하였습니다.' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: string;

  @ApiProperty({
    type: Array<CategoryGetResponseData>,
    isArray: true,
    description: '카테고리 목록',
    example: [
      {
        id: 1,
        parent: null,
        name: '자유게시판',
        depth: 1,
      },
      {
        id: 2,
        parent: 1,
        name: '후기 게시판',
        depth: 2,
      },
    ],
  })
  categories: CategoryGetResponseData[];
}
