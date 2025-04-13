import { Injectable, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { CreateUserDto } from "./user.dto";

//의존성 주입 받을수 있게함?
@Injectable()
export class UserService {
  constructor(
    //typeorm 의존성 주입 받음
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    //중복 검사
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException("Email already exists");
    }
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }
}
