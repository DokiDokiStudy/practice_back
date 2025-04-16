import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from "class-validator";

export class CreateUserDto {
  @IsEmail({}, { message: "Invalid email format" })
  @MaxLength(254, { message: "email max length 254" })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: "password min length 8" })
  @MaxLength(100)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/, {
    message: "Invalid password format",
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: "nickname min length 2" })
  nickName: string;
}
