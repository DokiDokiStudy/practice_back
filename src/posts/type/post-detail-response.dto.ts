import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

// Flat comment structure with depth (Issue #31-4)
export class CommentFlatDto {
  @ApiProperty({ example: 1, description: '댓글 ID' })
  @Expose()
  id: number;

  @ApiProperty({ example: null, required: false, description: '부모 댓글 ID' })
  @Expose()
  parentId: number | null;

  @ApiProperty({ example: 0, description: '댓글 깊이 (0: 최상위, 1: 대댓글, ...)' })
  @Expose()
  depth: number;

  @ApiProperty({ example: '작성자', description: '작성자 닉네임' })
  @Expose()
  author: string;

  @ApiProperty({ example: '댓글 내용' })
  @Expose()
  content: string;

  @ApiProperty({ example: 5, description: '좋아요 개수' })
  @Expose()
  likeCount: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  updatedAt: Date;
}

export class PostDetailResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: '게시물 제목' })
  @Expose()
  title: string;

  @ApiProperty({ example: '작성자' })
  @Expose()
  author: string;

  @ApiProperty({ example: '게시물 내용' })
  @Expose()
  content: string;

  @ApiProperty({ example: 1, required: false, description: '카테고리 ID' })
  @Expose()
  categoryId?: number | null;

  @ApiProperty({
    required: false,
    description: '카테고리 정보',
    example: { id: 1, name: 'Docker' },
  })
  @Expose()
  category?: { id: number; name: string } | null;

  @ApiProperty({ example: 1, required: false, description: '부모 게시글 ID' })
  @Expose()
  parentPostId?: number | null;

  @ApiProperty({
    required: false,
    description: '부모 게시글 요약 정보',
    example: { id: 5, title: '원본 게시글 제목', author: '작성자' },
  })
  @Expose()
  parentPost?: { id: number; title: string; author: string } | null;

  // @ApiProperty({
  //   type: 'array',
  //   description: '좋아요 목록',
  //   example: [{}],
  // })
  // @Expose()
  // likes: object[];

  @ApiProperty({ example: 1 })
  @Expose()
  likeCounts: number;

  @ApiProperty({ example: 1 })
  @Expose()
  commentsCount: number;

  @ApiProperty({
    type: () => [CommentFlatDto],
    description: '댓글 목록 (1차 배열, depth 포함)',
  })
  @Expose()
  @Type(() => CommentFlatDto)
  comments: CommentFlatDto[];

  @ApiProperty({
    required: false,
    description: '답글(쓰레드) 게시글 목록',
    example: [
      {
        id: 10,
        title: '답글 제목',
        author: '답글 작성자',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ],
  })
  @Expose()
  childrenPosts?: Array<{
    id: number;
    title: string;
    author: string;
    createdAt: Date;
  }>;
}
