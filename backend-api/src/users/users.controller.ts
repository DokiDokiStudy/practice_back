import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from 'src/common/decorators/api-response.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('유저 API')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '회원가입' })
  @ApiSuccessResponse('회원가입에 성공하였습니다.')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.usersService.signUp(createUserDto);
  }

  @Get('check-email')
  @ApiOperation({ summary: '이메일 중복 체크' })
  @ApiSuccessResponse('사용가능한 이메일입니다.')
  async validateEmail(@Query('email') email: string) {
    return await this.usersService.validateEmail(email);
  }

  @Patch(':id')
  @ApiOperation({ summary: '회원 정보 수정' })
  async updateUser(
    @Param('id') email: string, // TODO: 현재 ID가 테이블의 UNIQUE KEY라서 유저 ID 컬럼이 필요할 듯함
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateUser(email, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '회원 탈퇴' })
  deleteUser(@Param('id') email: string) {
    return this.usersService.deleteUser(email);
  }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }
}
