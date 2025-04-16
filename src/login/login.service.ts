import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../signup/entities/signup.entity";

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async login(email: string, password: string): Promise<string> {
    const user = await this.usersRepo.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException("email is incorrect");
    }
    if (user.password !== password) {
      throw new UnauthorizedException("password is incorrect");
    }

    return user.nickName;
  }
}
