import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseData {
  @ApiProperty({ example: 'test@test.com' })
  email: string;

  @ApiProperty({ example: 'nickname' })
  nickName: string;

  @ApiProperty({ example: 'user' })
  role: string;

  @ApiProperty({ example: 'token string' })
  token: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: '로그인에 성공하였습니다.' })
  message: string;

  @ApiProperty({ type: LoginResponseData })
  data: LoginResponseData;
}
