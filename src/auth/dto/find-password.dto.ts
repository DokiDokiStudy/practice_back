import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindPasswordDto {
  @IsEmail()
  @ApiProperty({ example: 'test@example.com', description: '가입한 이메일' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ example: '홍길동', description: '가입자 이름' })
  name: string; // Or nickName.. 이름이 조금 더 적절해 보임
}
