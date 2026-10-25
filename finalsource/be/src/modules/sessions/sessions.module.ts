import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SessionsController } from './sessions.controller';
import { SessionAccessGuard } from './auth/session-access.guard';
import { SessionsService } from './sessions.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [SessionsController],
  providers: [SessionAccessGuard, SessionsService],
})
export class SessionsModule {}
