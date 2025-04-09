import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindPasswordDto } from './dto/find-password.dto';

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
  @ApiResponse({
    status: 201,
    description: '회원가입에 성공하였습니다.',
    schema: {
      properties: {
        status: {
          type: 'boolean',
          description: 'API 호출 성공 여부',
          example: 201,
        },
        message: {
          type: 'string',
          description: 'API 호출 메세지',
          example: 'API 호출에 성공하였습니다.',
        },
        data: {
          type: 'object',
          description: 'API 응답값',
          example: {
            id: 1, // 생성된 user Id
            email: 'test@test.com', // 생성된 user email
            name: '홍길동', //  생성된 user 이름
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    schema: {
      properties: {
        status: {
          type: 'number',
          example: 409,
        },
        message: {
          type: 'string',
          example: '이미 존재하는 이메일입니다.',
        },
        errorCode: {
          type: 'string',
          example: 'user already exists',
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: '회원가입에 실패하였습니다.' })
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.signup(createUserDto);

    return {
      status: 201,
      message: '회원가입에 성공하였습니다.',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
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
