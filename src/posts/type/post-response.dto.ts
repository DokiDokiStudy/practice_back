import { ApiProperty } from '@nestjs/swagger';

export class PostGetResponseData {
  @ApiProperty({ example: 1 })
  id: string;

  @ApiProperty({ example: 1 })
  userId: string;

  @ApiProperty({
    isArray: true,
    example: {
      id: 1,
      name: 'name',
      createdAt: '2025-06-17T15:44:01.741Z',
      updatedAt: '2025-06-17T15:44:01.741Z',
      deletedAt: null,
    },
  })
  category: object;

  @ApiProperty({ example: 1 })
  categoryId: number;

  @ApiProperty({ example: 'title' })
  title: string;

  @ApiProperty({ example: 'author' })
  author: string;

  @ApiProperty({ example: 'content' })
  content: string;

  @ApiProperty({ example: '2025-06-17T15:50:10.834Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-06-17T15:50:10.834Z' })
  updatedAt: string;

  @ApiProperty({ example: '2025-06-17T15:50:10.834Z' })
  deletedAt: string | null;
}

export class PostGetResponseDto {
  @ApiProperty({ example: '게시글 조회에 성공하였습니다.' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: string;

  @ApiProperty({
    type: PostGetResponseData,
    isArray: true,
    description: '게시글 목록',
    example: [
      {
        id: 1,
        userId: 1,
        category: {
          id: 1,
          name: 'name',
          createdAt: '2025-06-17T15:44:01.741Z',
          updatedAt: '2025-06-17T15:44:01.741Z',
          deletedAt: null,
        },
        categoryId: 1,
        title: 'title',
        author: 'author',
        content: 'content',
        createdAt: '2025-06-17T15:50:10.834Z',
        updatedAt: '2025-06-17T15:50:10.834Z',
        deletedAt: null,
      },
    ],
  })
  data: { posts: PostGetResponseData };
  @ApiProperty({
    type: PostGetResponseData,
    isArray: true,
    description: '게시글 목록',
    example: {
      limit: 10,
      page: 1,
      total: 10,
      totalPages: 1,
    },
  })
  meta: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}

export class PostPostResponseDto {
  @ApiProperty({ example: '게시글이 생성되었습니다.' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: string;
}
