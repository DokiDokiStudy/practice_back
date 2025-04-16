import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../signup/entities/signup.entity";

@Injectable()
export class EmailCheckService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async isEmailCheck(email: string): Promise<boolean> {
    const user = await this.usersRepo.findOne({ where: { email } });
    return !user;
  }
}
