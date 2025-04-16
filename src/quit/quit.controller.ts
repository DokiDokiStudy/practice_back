import { Controller, Delete, Param } from "@nestjs/common";
import { QuitService } from "./quit.service";

@Controller("api")
export class QuitController {
  constructor(private readonly quitService: QuitService) {}

  @Delete(":email")
  async quit(@Param("email") email: string) {
    await this.quitService.quit(email);
    return { message: "quit successfully." };
  }
}
