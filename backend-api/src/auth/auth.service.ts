import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { FindPasswordDto } from './dto/find-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { email, password, name } = createUserDto;
      const exists = await this.usersRepository.findOneBy({
        email,
      });

      if (exists) {
        throw new ConflictException({
          status: 409,
          message: '이미 존재하는 이메일입니다.',
          errorCode: 'user already exists',
        });
      }

      if (name.length === 0) {
        throw new ConflictException({
          status: 409,
          message: '이름은 필수 값입니다.',
          errorCode: 'user name is required',
        });
      }
      // const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.usersRepository.create({
        email,
        password /* : hashedPassword */,
        name,
      });

      return await this.usersRepository.save(user);
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

  async findPassword(findPasswordDto: FindPasswordDto) {
    try {
      const { email, name } = findPasswordDto;
      const user = await this.usersRepository.findOneBy({
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
