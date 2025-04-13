import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { CreateUserDto } from "./user.dto";
export declare class UserService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(signUpReq: CreateUserDto): Promise<User>;
}
