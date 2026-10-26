import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USERNAME ?? 'app_user',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'app_database',
    autoLoadEntities: true,
    synchronize: false,
    migrationsRun: false,
  }),
);
