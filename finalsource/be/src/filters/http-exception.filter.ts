import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    response.status(status).json({ success: false, statusCode: status, message: this.safeMessage(exception, status), timestamp: new Date().toISOString(), path: request.url });
  }

  private safeMessage(exception: unknown, status: number): string | string[] {
    if (!(exception instanceof HttpException)) return 'Internal server error';
    const body = exception.getResponse();
    if (typeof body === 'string') return body;
    if (typeof body === 'object' && body !== null && 'message' in body) {
      const message = body.message;
      if (typeof message === 'string' || (Array.isArray(message) && message.every((item) => typeof item === 'string'))) return message;
    }
    return status >= 500 ? 'Internal server error' : 'Request failed';
  }
}
