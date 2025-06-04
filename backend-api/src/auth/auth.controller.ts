import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { AuthRequest } from './type/jwt';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';

@ApiTags('인증 API')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: AuthRequest) {
    return this.authService.me(req);
  }
}
