import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindIdDto {
  @IsEmail()
  @ApiProperty({ example: 'test@example.com', description: '가입한 이메일' })
  email: string;
}
