import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindPasswordDto } from './dto/find-password.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { AuthRequest, JwtPayload } from './type/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOneBy({
      email: loginDto.email,
    });

    if (!user)
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );

    const isPasswordValid = await argon2.verify(
      // 순서 중요
      user.password,
      loginDto.password,
    );

    if (!isPasswordValid)
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      nickName: user.nickName,
    };
    const token = `Bearer ${this.jwtService.sign(payload)}`;

    return {
      message: '로그인에 성공하였습니다.',
      statusCode: 200,
      nickName: user.nickName,
      token,
    };
  }

  authCheck(request: AuthRequest) {
    return request.user;
  }

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
