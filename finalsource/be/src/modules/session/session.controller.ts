import { Body, Controller, Get, Headers, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { DataSource } from 'typeorm';
import { JoinSessionDto } from './dto/join-session.dto';
import { SessionAuthGuard } from './session-auth.guard';
import { SessionJoinService } from './session-join.service';
import { ParticipantListService } from './participant-list.service';
import { SessionStateService } from './session-state.service';
import { ListParticipantsDto } from './dto/list-participants.dto';
import { ListChatMessagesDto } from './dto/list-chat-messages.dto';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { ChatMessageService } from './chat-message.service';
import { ReactionService } from './reaction.service';
import { SendReactionDto } from './dto/send-reaction.dto';
import { LiveStreamService } from './live-stream.service';
import { LiveStreamCommandDto } from './dto/live-stream-command.dto';

@Controller('/api/v1/sessions')
export class SessionController {
  constructor(
    private readonly joinService: SessionJoinService,
    private readonly participantListService: ParticipantListService,
    private readonly sessionStateService: SessionStateService,
    private readonly dataSource: DataSource,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly chatMessageService: ChatMessageService,
    private readonly reactionService: ReactionService,
    private readonly liveStreamService: LiveStreamService,
  ) {}

  @Post('demo')
  async createDemoSession() {
    const principalId = '11111111-1111-4111-8111-111111111111';
    const sessionId = '11111111-1111-4111-8111-111111111112';
    const userId = 'demo-user-uc02';
    await this.dataSource.transaction(async (manager) => {
      await manager.query('INSERT INTO principals (id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)', [principalId, userId]);
      await manager.query("INSERT INTO sessions (id, kind, status, designated_host_principal_id) VALUES (?, 'VIDEO_CONFERENCE', 'LOBBY', ?) ON DUPLICATE KEY UPDATE status = 'LOBBY', designated_host_principal_id = VALUES(designated_host_principal_id), host_participant_id = NULL, version = 0", [sessionId, principalId]);
      await manager.query('DELETE FROM participants WHERE session_id = ? AND principal_id = ?', [sessionId, principalId]);
    });
    const accessToken = await this.jwt.signAsync(
      { sub: principalId, userId, sessionId },
      { secret: this.config.getOrThrow<string>('JWT_SECRET') },
    );
    return { success: true, data: { sessionId, accessToken } };
  }

  @Get(':sessionId/state')
  @UseGuards(SessionAuthGuard)
  async readState(@Param('sessionId') sessionId: string, @Query('reactionCursor') reactionCursor: string | undefined, @Req() request: Request) {
    const data = await this.sessionStateService.readState(sessionId, reactionCursor, request.sessionPrincipal!);
    return { success: true, message: 'Session state loaded', data };
  }

  @Post(':sessionId/live-stream/commands')
  @UseGuards(SessionAuthGuard)
  async controlLiveStream(@Param('sessionId') sessionId: string, @Headers('idempotency-key') idempotencyKey: string | undefined, @Body() dto: LiveStreamCommandDto, @Req() request: Request) {
    const data = await this.liveStreamService.control(sessionId, idempotencyKey, dto, request.sessionPrincipal!);
    return { success: true, message: 'Live stream command accepted', data };
  }

  @Get(':sessionId/participants')
  @UseGuards(SessionAuthGuard)
  async listParticipants(@Param('sessionId') sessionId: string, @Query() query: ListParticipantsDto, @Req() request: Request) {
    const data = await this.participantListService.list(sessionId, query, request.sessionPrincipal!);
    return { success: true, message: 'Participants loaded', data };
  }

  @Post(':sessionId/participants')
  @UseGuards(SessionAuthGuard)
  async join(@Param('sessionId') sessionId: string, @Headers('idempotency-key') idempotencyKey: string | undefined, @Body() dto: JoinSessionDto, @Req() request: Request) {
    const data = await this.joinService.join(sessionId, idempotencyKey, dto, request.sessionPrincipal!);
    return { success: true, message: 'Session joined', data };
  }

  @Get(':sessionId/chat/messages')
  @UseGuards(SessionAuthGuard)
  async listChatMessages(@Param('sessionId') sessionId: string, @Query() query: ListChatMessagesDto, @Req() request: Request) {
    const data = await this.chatMessageService.list(sessionId, query, request.sessionPrincipal!);
    return { success: true, message: 'Chat history loaded', data };
  }

  @Post(':sessionId/chat/messages')
  @UseGuards(SessionAuthGuard)
  async sendChatMessage(@Param('sessionId') sessionId: string, @Headers('idempotency-key') idempotencyKey: string | undefined, @Body() dto: SendChatMessageDto, @Req() request: Request) {
    const data = await this.chatMessageService.send(sessionId, idempotencyKey, dto, request.sessionPrincipal!);
    return { success: true, message: 'Chat message created', data };
  }

  @Post(':sessionId/reactions')
  @UseGuards(SessionAuthGuard)
  async sendReaction(@Param('sessionId') sessionId: string, @Headers('idempotency-key') idempotencyKey: string | undefined, @Body() dto: SendReactionDto, @Req() request: Request) {
    const data = await this.reactionService.send(sessionId, idempotencyKey, dto, request.sessionPrincipal!);
    return { success: true, message: 'Reaction created', data };
  }
}
