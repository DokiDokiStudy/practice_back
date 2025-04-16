import { Body, Controller, Post } from "@nestjs/common";
import { LoginService } from "./login.service";
import { LoginDto } from "./dto/login.dto";

@Controller("api")
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post("login")
  async login(@Body() body: LoginDto) {
    const nickName = await this.loginService.login(body.email, body.password);
    return { nickName };
  }
}
