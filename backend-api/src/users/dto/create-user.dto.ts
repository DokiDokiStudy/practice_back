import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  nickName: string;

  @ApiProperty()
  @IsNotEmpty()
  securityQuestion: string;

  @ApiProperty()
  @IsNotEmpty()
  securityAnswer: string;
}
