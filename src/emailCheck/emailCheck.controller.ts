import { Controller, Get, Query, BadRequestException } from "@nestjs/common";
import { EmailCheckService } from "./emailCheckService";

@Controller("api")
export class EmailCheckController {
  constructor(private readonly emailCheckService: EmailCheckService) {}

  @Get("check-email")
  async checkEmail(@Query("email") email: string) {
    if (!email || !email.includes("@")) {
      throw new BadRequestException("Invalid email");
    }

    const available = await this.emailCheckService.isEmailCheck(email);
    return { available };
  }
}
