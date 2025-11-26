import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './type/jwt';
import { createApiResponse } from 'src/common/create-api-response';
import { FindIdDto } from './dto/find-id.dto';
import { FindPasswordDto } from './dto/find-password.dto';

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

  /** 로그인 */
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

  /** 이메일로 ID 찾기 */
  async findId(dto: FindIdDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: dto.email },
      });

      if (!user) {
        return createApiResponse(404, '해당 이메일의 사용자가 존재하지 않습니다.');
      }

      return createApiResponse(200, '아이디 조회 성공', {
        email: user.email,
      });
    } catch (error) {
      console.error(error);
      return createApiResponse(500, '아이디 찾기 요청 처리 중 오류가 발생했습니다.');
    }
  }

  /** 비밀번호 재설정(임시 비밀번호 발급) */
  async findPassword(dto: FindPasswordDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: dto.email, name: dto.name },
      });

      if (!user) {
        return createApiResponse(404, '일치하는 계정 정보가 없습니다.');
      }

      // 임시 비밀번호 생성
      const tempPassword = Math.random().toString(36).slice(-8);

      // 암호화
      const hashed = await argon2.hash(tempPassword);

      user.password = hashed;
      await this.userRepository.save(user);

      // TODO : 실제로 응답을 줄 것이 아니고 이메일로 전송하도록 해야 함
      return createApiResponse(200, '임시 비밀번호가 발급되었습니다.', {
        tempPassword,
      });
    } catch (error) {
      console.error(error);
      return createApiResponse(500, '비밀번호 재설정 중 오류가 발생했습니다.');
    }
  }
}
