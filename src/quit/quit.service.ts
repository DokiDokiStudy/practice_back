import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../signup/entities/signup.entity";

@Injectable()
export class QuitService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async quit(email: string): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException("User does not exist");
    }
    if (!user.isActive) {
      throw new ConflictException("User is already quit");
    }

    user.isActive = false;
    await this.usersRepo.save(user);
  }
}
