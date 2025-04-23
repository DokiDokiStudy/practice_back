import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../type/api-response.type';

interface ExceptionResponseObject {
  message?: string | string[];
  errorCode?: string;
  details?: Record<string, any>;
  [key: string]: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage: string | string[] = 'Internal server error';
    let errorName = 'InternalServerError';
    let errorCode: string | undefined = undefined;
    let details: Record<string, any> | undefined = undefined;

    // Http exception
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorName = exception.name;
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as ExceptionResponseObject;
        errorMessage = responseObj.message || 'error';
        errorCode = responseObj.errorCode;
        details = responseObj.details;
      }
    }
    //js exception
    else if (exception instanceof Error) {
      errorMessage = exception.message;
      errorName = exception.name;
    }

    const finalMessage = Array.isArray(errorMessage)
      ? errorMessage[0]
      : errorMessage;

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode: status,
      message: finalMessage,
      error: errorName,
      errorType: exception instanceof HttpException ? 'http' : 'runtime',
      errorCode,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
