import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  content: string;
}
