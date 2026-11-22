import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionJoinService } from './session-join.service';

@Module({ controllers: [SessionsController], providers: [SessionJoinService] })
export class SessionsModule {}
