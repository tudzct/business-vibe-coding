import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface NestErrorBody {
  message?: string | string[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(statusCode).json({
      success: false,
      statusCode,
      message: this.getSafeMessage(exception),
      timestamp: new Date().toISOString(),
      path: request.originalUrl || request.url,
    });
  }

  private getSafeMessage(exception: unknown): string | string[] {
    if (!(exception instanceof HttpException)) {
      return 'Registration could not be completed.';
    }
    const body: unknown = exception.getResponse();
    if (typeof body === 'string') {
      return body;
    }
    if (this.isNestErrorBody(body) && body.message) {
      return body.message;
    }
    return exception.message;
  }

  private isNestErrorBody(value: unknown): value is NestErrorBody {
    return typeof value === 'object' && value !== null && 'message' in value;
  }
}
