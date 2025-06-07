import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { CheckEmailDto } from './dto/check-email.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@ApiTags('유저 API')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  @Patch(':id')
  @HttpCode(200)
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateUser(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(200)
  deleteUser(@Param('id') id: number) {
    return this.usersService.deleteUser(id);
  }
}
