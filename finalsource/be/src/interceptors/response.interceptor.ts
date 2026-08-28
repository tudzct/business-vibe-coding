import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiResponse<T> { success: true; message: string; data: T }

export interface MessageResponse<T> { message: string; data: T }

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T | MessageResponse<T>, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(map((value) => {
      if (this.isMessageResponse(value)) {
        return { success: true, message: value.message, data: value.data };
      }
      return { success: true, message: 'Request completed successfully', data: value };
    }));
  }

  private isMessageResponse(value: T | MessageResponse<T>): value is MessageResponse<T> {
    return typeof value === 'object' && value !== null && 'message' in value && 'data' in value;
  }
}
