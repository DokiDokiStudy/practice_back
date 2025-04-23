import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 회원가입
  async signUp(createUserDto: CreateUserDto) {
    const existing = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (existing) throw new BadRequestException('이미 존재하는 이메일입니다.');

    const hashedPassword = await argon2.hash(createUserDto.password);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    user.role = 'user';
    user.isActive = true;
    await this.userRepository.save(user);
    const { createdAt } = (await this.userRepository.findOneBy({
      email: user.email,
    })) as User;

    return {
      message: '회원가입에 성공하였습니다.',
      statusCode: 200,
      id: user.id,
      email: user.email,
      createdAt,
    };
  }

  // 이메일 중복 체크
  async validateEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user)
      return {
        message: '사용 가능한 이메일입니다.',
        statusCode: 200,
        available: true,
      };

    return {
      message: '이미 사용중인 이메일입니다.',
      statusCode: 400,
      available: false,
    };
  }

  // 회원 정보 수정
  async updateUser(email: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({
      email: email,
    });
    if (!user)
      return {
        message: '사용자를 찾을 수 없습니다.',
        statusCode: 404,
      };

    const updated = Object.assign(user, updateUserDto);
    await this.userRepository.save(updated);

    return {
      message: '회원정보 수정에 성공하였습니다.',
      statusCode: 200,
      id: updated.id,
      email: updated.email,
      name: updated.name,
    };
  }

  async deleteUser(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user)
      return {
        message: '사용자를 찾을 수 없습니다.',
        statusCode: 404,
      };

    await this.userRepository.softDelete({ email });

    return {
      message: '탈퇴에 성공하였습니다.',
      statusCode: 200,
    };
  }

  // findAll() {
  //   return `This action returns all users`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }
}
