import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './type/auth-response.dto';
import { ApiSuccessResponse } from 'src/common/decorators/api-response.decorator';

@ApiTags('AUTH API')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '로그인' })
  @HttpCode(200)
  @Post('login')
  @ApiExtraModels(LoginResponseDto) // DTO 명시적 등록
  @ApiSuccessResponse('로그인에 성공하였습니다.', LoginResponseDto)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
