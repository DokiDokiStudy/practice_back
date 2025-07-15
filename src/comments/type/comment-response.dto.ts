import { ApiProperty } from '@nestjs/swagger';

// export class CommentCreateResponseDto {
//   @ApiProperty({ example: 1 })
//   id: string;

//   @ApiProperty({ example: 1 })
//   userId: string;

//   @ApiProperty({
//     isArray: true,
//     example: {
//       id: 1,
//       name: 'name',
//       createdAt: '2025-06-17T15:44:01.741Z',
//       updatedAt: '2025-06-17T15:44:01.741Z',
//       deletedAt: null,
//     },
//   })
//   category: object;
// }

export class CommentCreateResponseDto {
  @ApiProperty({ example: '게시글이 생성되었습니다.' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: string;
}

// "statusCode": 201,
// "message": "댓글이 등록되었습니다."
