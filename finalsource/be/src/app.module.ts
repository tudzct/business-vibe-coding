import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './common/health/health.controller';
import { SessionsModule } from './modules/sessions/sessions.module';

@Module({
  imports: [DatabaseModule, SessionsModule],
  controllers: [HealthController],
})
export class AppModule {}
