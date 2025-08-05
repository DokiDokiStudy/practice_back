import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class CommentDetailDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: '댓글 내용' })
  @Expose()
  content: string;

  @ApiProperty({ example: 1 })
  @Expose()
  childrenCount: number;

  @ApiProperty({
    type: () => [CommentDetailDto],
    description: '대댓글 목록',
  })
  @Expose()
  @Type(() => CommentDetailDto)
  children: CommentDetailDto[];
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
    type: () => [CommentDetailDto],
    description: '댓글 목록',
  })
  @Expose()
  @Type(() => CommentDetailDto)
  comments: CommentDetailDto[];
}
