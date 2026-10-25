import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') ?? [
    'http://localhost:8080',
  ];

  app.enableCors({ origin: allowedOrigins, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(Number(process.env.PORT ?? 3000));
}

void bootstrap();
