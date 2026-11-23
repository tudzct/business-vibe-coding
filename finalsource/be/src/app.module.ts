import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './common/health/health.controller';
import { SessionModule } from './modules/session/session.module';

@Module({
  imports: [DatabaseModule, SessionModule],
  controllers: [HealthController],
})
export class AppModule {}
