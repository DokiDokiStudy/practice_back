import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiExtraModels, ApiOperation, ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { FindIdDto } from './dto/find-id.dto';
import { FindPasswordDto } from './dto/find-password.dto';
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

  @Post('find-id')
  @ApiOperation({
    summary: '이메일로 아이디 찾기',
    description: '이메일을 입력하면 가입된 아이디(email)를 반환합니다.',
  })
  @ApiBody({ type: FindIdDto })
  @ApiResponse({
    status: 200,
    description: '아이디 조회 성공',
    schema: {
      example: {
        statusCode: 200,
        message: '아이디 조회 성공',
        data: {
          email: 'test@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '해당 이메일의 사용자가 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '해당 이메일의 사용자가 존재하지 않습니다.',
      },
    },
  })
  async findId(@Body() dto: FindIdDto) {
    return this.authService.findId(dto);
  }

  @Post('find-password')
  @ApiOperation({
    summary: '비밀번호 찾기 (임시 비밀번호 발급)',
    description:
      '이메일 + 이름이 일치하면 임시 비밀번호를 생성하여 반환합니다.',
  })
  @ApiBody({ type: FindPasswordDto })
  @ApiResponse({
    status: 200,
    description: '임시 비밀번호 발급 성공',
    schema: {
      example: {
        statusCode: 200,
        message: '임시 비밀번호가 발급되었습니다.',
        data: {
          tempPassword: 'a1b2c3d4',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '일치하는 계정 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '일치하는 계정 정보가 없습니다.',
      },
    },
  })
  async findPassword(@Body() dto: FindPasswordDto) {
    return this.authService.findPassword(dto);
  }
}
