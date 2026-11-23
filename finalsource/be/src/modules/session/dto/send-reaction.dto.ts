import { IsEnum } from 'class-validator';

export enum ReactionCode { LIKE = 'LIKE', CLAP = 'CLAP', HEART = 'HEART', CELEBRATE = 'CELEBRATE', HAND = 'HAND', SURPRISE = 'SURPRISE' }

export class SendReactionDto {
  @IsEnum(ReactionCode)
  reaction!: ReactionCode;
}
