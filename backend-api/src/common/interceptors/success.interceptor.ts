import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../type/api-response.type';
import { Request, Response } from 'express';

@Injectable()
export class SuccessInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    //실행 컨텍스트
    context: ExecutionContext,
    //다음 핸들러
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const now = new Date();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const path = request.url;

    //컨트롤러 메서드를 실행하고 결과를 Observable로 반환
    //특정 적용: @UseInterceptors(SuccessInterceptor)
    return next.handle().pipe(
      map((data: unknown): ApiResponse<T> => {
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'statusCode' in data &&
          'message' in data
        ) {
          return data as ApiResponse<T>;
        }

        return {
          success: true,
          statusCode: response.statusCode || 200,
          message: 'success',
          data: data as T,
          timestamp: now.toISOString(),
          path,
        };
      }),
    );
  }
}
