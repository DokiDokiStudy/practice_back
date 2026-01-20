import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PostGetResponseData {
  @ApiProperty({ example: 1 })
  @Expose()
  id: string;

  @ApiProperty({ example: 1 })
  @Expose()
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
  @Expose()
  category: object;

  @ApiProperty({ example: 1 })
  @Expose()
  categoryId: number;

  @ApiProperty({ example: 1, required: false, description: '부모 게시글 ID (쓰레드인 경우)' })
  @Expose()
  parentPostId?: number | null;

  @ApiProperty({ example: 5, required: false, description: '답글(자식 게시글) 개수' })
  @Expose()
  childrenCount?: number;

  @ApiProperty({ example: 'title' })
  @Expose()
  title: string;

  @ApiProperty({ example: 'author' })
  @Expose()
  author: string;

  @ApiProperty({ example: 'content' })
  @Expose()
  content: string;

  @ApiProperty({ example: '2025-06-17T15:50:10.834Z' })
  @Expose()
  createdAt: string;

  @ApiProperty({ example: '2025-06-17T15:50:10.834Z' })
  @Expose()
  updatedAt: string;

  @ApiProperty({ example: '2025-06-17T15:50:10.834Z' })
  @Expose()
  deletedAt: string | null;
}

export class PostGetResponseDto {
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
  posts: PostGetResponseData[];

  @ApiProperty({
    type: PostGetResponseData,
    isArray: true,
    description: '페이지네이션 정보',
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
