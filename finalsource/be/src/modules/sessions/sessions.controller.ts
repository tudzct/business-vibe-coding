import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentPrincipal } from './auth/current-principal.decorator';
import { SessionAccessGuard } from './auth/session-access.guard';
import type { SessionPrincipal } from './auth/session-principal';
import { JoinSessionDto } from './dto/join-session.dto';
import { CompleteLiveStreamDto } from './dto/complete-live-stream.dto';
import { LiveStreamCommandDto } from './dto/live-stream-command.dto';
import { SessionStateQueryDto } from './dto/session-state-query.dto';
import { SessionsService, type SuccessEnvelope } from './sessions.service';

@Controller('api/v1/sessions')
@UseGuards(SessionAccessGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post(':sessionId/participants')
  @HttpCode(HttpStatus.CREATED)
  join(
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: JoinSessionDto,
    @CurrentPrincipal() principal: SessionPrincipal,
  ): Promise<SuccessEnvelope> {
    return this.sessionsService.join(sessionId, idempotencyKey, body, principal);
  }

  @Post(':sessionId/live-stream/commands')
  @HttpCode(HttpStatus.OK)
  commandLiveStream(
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: LiveStreamCommandDto,
    @CurrentPrincipal() principal: SessionPrincipal,
  ): Promise<SuccessEnvelope> {
    return this.sessionsService.commandLiveStream(sessionId, idempotencyKey, body, principal);
  }

  @Post(':sessionId/live-stream/complete')
  @HttpCode(HttpStatus.OK)
  complete(@Param('sessionId', new ParseUUIDPipe()) sessionId: string, @Body() body: CompleteLiveStreamDto, @CurrentPrincipal() principal: SessionPrincipal): Promise<SuccessEnvelope> {
    return this.sessionsService.completeLiveStream(sessionId, body, principal);
  }

  @Get(':sessionId/live-stream/view')
  viewLiveStream(
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Headers('accept') acceptHeader: string | undefined,
    @CurrentPrincipal() principal: SessionPrincipal,
  ): Promise<SuccessEnvelope> {
    return this.sessionsService.viewLiveStream(sessionId, acceptHeader, principal);
  }

  @Get(':sessionId/state')
  getState(
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Query() query: SessionStateQueryDto,
    @CurrentPrincipal() principal: SessionPrincipal,
  ): Promise<SuccessEnvelope> {
    return this.sessionsService.getState(sessionId, query, principal);
  }
}
