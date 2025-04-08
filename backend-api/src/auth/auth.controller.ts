import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('인증 API')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('users')
  @ApiOperation({
    summary: '회원가입 API',
    description: '회원정보를 추가합니다.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: '회원가입에 성공하였습니다.' })
  @ApiResponse({ status: 404, description: '회원가입에 실패하였습니다.' })
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }
}
