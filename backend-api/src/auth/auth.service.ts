import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { CreateUserDto } from './dto/create-user.dto';
import { FindPasswordDto } from './dto/find-password.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOneBy({
      email: loginDto.email,
    });

    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    // const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (loginDto.password !== user.password)
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');

    return {
      message: '로그인에 성공하였습니다.',
      statusCode: 200,
      nickName: user.nickName,
      token: 'Bearer ' + user.password,
    };
  }

  // async signup(createUserDto: CreateUserDto): Promise<User> {
  //   try {
  //     const { email, password, name } = createUserDto;
  //     const exists = await this.usersRepository.findOneBy({
  //       email,
  //     });

  //     if (exists) {
  //       throw new ConflictException({
  //         status: 409,
  //         message: '이미 존재하는 이메일입니다.',
  //         errorCode: 'user already exists',
  //       });
  //     }

  //     if (name.length === 0) {
  //       throw new ConflictException({
  //         status: 409,
  //         message: '이름은 필수 값입니다.',
  //         errorCode: 'user name is required',
  //       });
  //     }
  //     // const hashedPassword = await bcrypt.hash(password, 10);

  //     const user = this.usersRepository.create({
  //       email,
  //       password /* : hashedPassword */,
  //       name,
  //     });

  //     return await this.usersRepository.save(user);
  //   } catch (error) {
  //     const { code, message } = error as unknown as {
  //       code: number;
  //       message: string;
  //     };
  //     throw new ConflictException({
  //       status: code ?? 500,
  //       message: message ?? '오류가 발생했습니다.',
  //     });
  //   }
  // }

  async findPassword(findPasswordDto: FindPasswordDto) {
    try {
      const { email, name } = findPasswordDto;
      const user = await this.userRepository.findOneBy({
        email,
        name,
      });

      if (user) {
        return user.password;
      } else {
        throw new ConflictException({
          status: 409,
          message: '일치하는 유저가 없습니다1.',
          errorCode: 'user not found',
        });
      }
    } catch (error) {
      const { code, message } = error as unknown as {
        code: number;
        message: string;
      };
      throw new ConflictException({
        status: code ?? 500,
        message: message ?? '오류가 발생했습니다.',
      });
    }
  }
}
