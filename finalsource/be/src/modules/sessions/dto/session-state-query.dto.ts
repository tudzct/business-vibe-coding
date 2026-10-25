import { IsOptional, IsString } from 'class-validator';

export class SessionStateQueryDto {
  @IsOptional()
  @IsString()
  readonly reactionCursor?: string;
}
