import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  postId: number;

  @ApiProperty()
  @IsOptional()
  commentId: number;

  @ApiProperty()
  @IsNotEmpty()
  content: string;
}
