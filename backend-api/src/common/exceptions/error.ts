//에러 정의해서 반환
import { HttpException } from '@nestjs/common';

export class BadRequestException extends HttpException {}

export class UnauthorizedException extends HttpException {}

export class ForbiddenException extends HttpException {}

export class NotFoundException extends HttpException {}

export class ConflictException extends HttpException {}

export class InternalServerErrorException extends HttpException {}
