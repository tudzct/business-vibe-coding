import { Body, Controller, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JoinSessionDto } from './dto/join-session.dto';
import { SessionAuthGuard } from './session-auth.guard';
import { SessionJoinService } from './session-join.service';

@Controller('/api/v1/sessions')
export class SessionController {
  constructor(private readonly joinService: SessionJoinService) {}

  @Post(':sessionId/participants')
  @UseGuards(SessionAuthGuard)
  async join(@Param('sessionId') sessionId: string, @Headers('idempotency-key') idempotencyKey: string | undefined, @Body() dto: JoinSessionDto, @Req() request: Request) {
    const data = await this.joinService.join(sessionId, idempotencyKey, dto, request.sessionPrincipal!);
    return { success: true, message: 'Session joined', data };
  }
}
