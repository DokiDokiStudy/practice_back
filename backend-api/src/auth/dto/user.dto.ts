import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // nickName: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // name: string;
}
