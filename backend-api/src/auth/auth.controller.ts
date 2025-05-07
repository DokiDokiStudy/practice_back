import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  // ApiResponse,
} from '@nestjs/swagger';
import { FindPasswordDto } from './dto/find-password.dto';
// import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { ApiSuccessResponse } from 'src/common/decorators/api-response.decorator';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from './type/jwt';

@ApiTags('인증 API')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiSuccessResponse('로그인에 성공하였습니다.')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('auth-check')
  authCheck(@Request() req: AuthRequest) {
    return this.authService.authCheck(req);
  }

  @Post('find-password')
  @ApiOperation({
    summary: '비밀번호 찾기 API',
    description: '비밀번호를 찾습니다.',
  })
  @ApiBody({ type: FindPasswordDto })
  async findPassword(@Body() findPasswordDto: FindPasswordDto) {
    const password = await this.authService.findPassword(findPasswordDto);

    return {
      status: 201,
      message: '비밀번호 찾기에 성공하였습니다.',
      data: {
        password,
      },
    };
  }
}
