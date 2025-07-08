import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { JwtPayload } from 'src/auth/type/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  me(user: JwtPayload) {
    return {
      message: '조회에 성공하였습니다.',
      data: user,
    };
  }

  async signUp(createUserDto: CreateUserDto) {
    const existingEmail = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    if (existingEmail) {
      throw new BadRequestException({
        message: '이미 존재하는 이메일입니다.',
        errorCode: 'USER_ALREADY_EXISTS',
      });
    }

    const hashedPassword = await argon2.hash(createUserDto.password);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: 'user',
      isActive: true,
    });
    const createdUser = await this.userRepository.save(user);

    return {
      message: '회원가입에 성공하였습니다.',
      data: {
        id: createdUser.id,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
      },
    };
  }

  async checkEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });

    return {
      available: !user,
      message: user
        ? '이미 사용중인 이메일입니다.'
        : '사용 가능한 이메일입니다.',
    };
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailTaken = await this.userRepository.findOneBy({
        email: updateUserDto.email,
      });
      if (emailTaken) {
        throw new BadRequestException({
          message: '이미 사용중인 이메일입니다.',
          errorCode: 'EMAIL_ALREADY_EXISTS',
        });
      }
    }

    const updatedUser = this.userRepository.merge(user, updateUserDto);

    await this.userRepository.save(updatedUser);

    return {
      message: '회원정보 수정에 성공하였습니다.',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        nickName: updatedUser.nickName,
      },
    };
  }

  async deleteUser(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException({
        message: '사용자를 찾을 수 없습니다.',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    await this.userRepository.softDelete({ id });

    return {
      message: '탈퇴에 성공하였습니다.',
    };
  }

  async findAdminUser() {
    const adminUser = await this.userRepository.findOneBy({
      role: 'admin',
    });
    return adminUser;
  }

  async createAdminUser(createUserDto: CreateUserDto) {
    const existingEmail = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    if (existingEmail) {
      throw new BadRequestException({
        message: '이미 존재하는 이메일입니다.',
        errorCode: 'USER_ALREADY_EXISTS',
      });
    }

    const hashedPassword = await argon2.hash(createUserDto.password);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });
    const createdUser = await this.userRepository.save(user);

    return {
      message: '관리자 계정 생성에 성공하였습니다.',
      data: {
        id: createdUser.id,
        email: createdUser.email,
        nickName: createdUser.nickName,
        role: createdUser.role,
        createdAt: createdUser.createdAt,
      },
    };
  }
}
