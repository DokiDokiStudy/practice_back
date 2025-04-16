import { Controller, Post, Body, HttpStatus } from "@nestjs/common";
import { UserService } from "./signup.service";
import { CreateUserDto } from "./dto/signup.dto";

@Controller("user")
export class UserController {
  //서비스 의존성 주입
  constructor(private readonly usersService: UserService) {}

  @Post("signup")
  //DTO 유효성 검사 후 처리됨
  async signup(@Body() signUpReq: CreateUserDto) {
    const user = await this.usersService.create(signUpReq);
    return { message: "created user", user };
  }
}
