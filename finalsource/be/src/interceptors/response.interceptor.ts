import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiResponse<T> { success: true; message: string; data: T }

export interface ApiResponsePayload<T> { message: string; data: T }

function isResponsePayload<T>(value: T | ApiResponsePayload<T>): value is ApiResponsePayload<T> {
  return typeof value === 'object' && value !== null && 'message' in value && 'data' in value;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(map((value: T | ApiResponsePayload<T>) => {
      if (isResponsePayload(value)) return { success: true, message: value.message, data: value.data };
      return { success: true, message: 'Request completed successfully', data: value };
    }));
  }
}
