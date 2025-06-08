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
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { CheckEmailDto } from './dto/check-email.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { AuthRequest } from 'src/auth/type/jwt';

@ApiTags('유저 API')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(200)
  me(@Request() req: AuthRequest) {
    return this.usersService.me(req.user);
  }

  @Post()
  @HttpCode(200)
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.usersService.signUp(createUserDto);
  }

  @Get('check-email')
  @HttpCode(200)
  async checkEmail(@Query() checkEmailDto: CheckEmailDto) {
    return await this.usersService.checkEmail(checkEmailDto.email);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  @HttpCode(200)
  async updateUser(
    @Request() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateUser(req.user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  @HttpCode(200)
  deleteUser(@Request() req: AuthRequest) {
    return this.usersService.deleteUser(req.user.id);
  }
}
