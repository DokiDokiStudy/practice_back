import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ example: 'test@test.com' })
  email: string;

  @ApiProperty({ example: 'nickname' })
  nickName: string;

  @ApiProperty({ example: 'user' })
  role: string;

  @ApiProperty({ example: 'token string' })
  token: string;
}
