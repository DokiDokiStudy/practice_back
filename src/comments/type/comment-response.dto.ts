import { ApiProperty } from '@nestjs/swagger';

export class CommentCreateResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: string;
}
export class UserResponseDto {
  @ApiProperty({ example: 1, description: '유저 ID' })
  id: number;

  @ApiProperty({ example: 'test@test.com', description: '유저 이메일' })
  email: string;

  @ApiProperty({ example: 'test', description: '유저 이름' })
  name: string;

  @ApiProperty({ example: 'test', description: '유저 닉네임' })
  nickName: string;

  @ApiProperty({ example: true, description: '유저 활성 상태' })
  isActive: boolean;

  @ApiProperty({ example: 'user', description: '유저 역할' })
  role: string;

  @ApiProperty({
    example: '2025-07-06T09:25:11.231Z',
    description: '유저 생성 날짜',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-07-06T09:25:11.231Z',
    description: '유저 수정 날짜',
  })
  updatedAt: string;

  @ApiProperty({
    example: null,
    description: '유저 삭제 날짜 (삭제되지 않은 경우 null)',
  })
  deletedAt: string | null;
}

export class CommentResponseDto {
  @ApiProperty({ example: 1, description: '댓글 ID' })
  id: number;

  @ApiProperty({ type: UserResponseDto, description: '댓글 작성자 정보' })
  user: UserResponseDto;

  @ApiProperty({ example: 1, description: '게시글 ID' })
  postId: number;

  @ApiProperty({ example: 'test', description: '댓글 작성자 이름' })
  author: string;

  @ApiProperty({ example: '2번째 댓글', description: '댓글 내용' })
  content: string;

  @ApiProperty({
    example: '2025-07-08T14:38:45.131Z',
    description: '댓글 생성 날짜',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-07-08T14:38:45.131Z',
    description: '댓글 수정 날짜',
  })
  updatedAt: string;

  @ApiProperty({
    example: null,
    description: '댓글 삭제 날짜 (삭제되지 않은 경우 null)',
  })
  deletedAt: string | null;
}

export class CommentGetResponseDto {
  @ApiProperty({ type: CommentResponseDto, description: '댓글 정보' })
  comment: CommentResponseDto;

  @ApiProperty({ example: 0, description: '댓글 좋아요 수' })
  likeCount: number;

  @ApiProperty({
    example: false,
    description: '현재 요청자가 댓글 작성자인지 여부',
  })
  writerIsMe: boolean;
}
