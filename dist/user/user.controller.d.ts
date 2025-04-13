import { UserService } from "./user.service";
import { CreateUserDto } from "./user.dto";
export declare class UserController {
    private readonly usersService;
    constructor(usersService: UserService);
    signup(signUpReq: CreateUserDto): Promise<{
        message: string;
        user: import("../entities/user.entity").User;
    }>;
}
