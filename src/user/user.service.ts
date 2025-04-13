import { Injectable, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { CreateUserDto } from "./user.dto";

//의존성 주입을 할수 있음
@Injectable()
export class UserService {
    constructor(
        //UserEntity로 레포지토리 만듬
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async create(signUpReq: CreateUserDto): Promise<User> {
        console.log("signUpReq", signUpReq);
        //중복 검사
        const existingUser = await this.usersRepository.findOne({
            where: { email: signUpReq.email },
        });
        if (existingUser) {
            throw new ConflictException("Email already exists");
        }
        const user = this.usersRepository.create(signUpReq);
        return this.usersRepository.save(user);
    }
}
