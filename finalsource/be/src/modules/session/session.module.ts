import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { SessionController } from './session.controller';
import { SessionJoinService } from './session-join.service';
import { SessionAuthGuard } from './session-auth.guard';
import { ParticipantListService } from './participant-list.service';
import { SessionStateService } from './session-state.service';
import { ChatMessageService } from './chat-message.service';
import { ReactionService } from './reaction.service';

@Module({
  imports: [ConfigModule, JwtModule.register({})],
  controllers: [SessionController],
  providers: [SessionJoinService, ParticipantListService, SessionStateService, ChatMessageService, ReactionService, SessionAuthGuard],
})
export class SessionModule {}
