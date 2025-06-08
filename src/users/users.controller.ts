import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Delete,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { CheckEmailDto } from './dto/check-email.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { AuthRequest } from 'src/auth/type/jwt';

@ApiTags('유저 API')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: '내 정보 조회',
  })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(200)
  me(@Request() req: AuthRequest) {
    return this.usersService.me(req.user);
  }

  @ApiOperation({
    summary: '회원가입',
  })
  @Post()
  @HttpCode(200)
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.usersService.signUp(createUserDto);
  }

  @ApiOperation({
    summary: '이메일 중복 확인',
  })
  @Get('check-email')
  @HttpCode(200)
  async checkEmail(@Query() checkEmailDto: CheckEmailDto) {
    return await this.usersService.checkEmail(checkEmailDto.email);
  }

  @ApiOperation({
    summary: '사용자 정보 수정',
  })
  @UseGuards(JwtAuthGuard)
  @Patch()
  @HttpCode(200)
  async updateUser(
    @Request() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateUser(req.user.id, updateUserDto);
  }

  @ApiOperation({
    summary: '회원 탈퇴',
  })
  @UseGuards(JwtAuthGuard)
  @Delete()
  @HttpCode(200)
  deleteUser(@Request() req: AuthRequest) {
    return this.usersService.deleteUser(req.user.id);
  }
}
