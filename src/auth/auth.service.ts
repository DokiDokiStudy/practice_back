import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './type/jwt';
import { createApiResponse } from 'src/common/create-api-response';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user || !(await argon2.verify(user.password, password))) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }
    return user;
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);

      const payload: JwtPayload = {
        id: user.id,
        email: user.email,
        nickName: user.nickName,
      };
      const token = this.jwtService.sign(payload);

      return createApiResponse(200, '로그인에 성공하였습니다.', {
        email: user.email,
        nickName: user.nickName,
        role: user.role,
        token,
      });
    } catch (error) {
      console.error(error);
      return createApiResponse(500, '로그인에 실패하였습니다.');
    }
  }
}
