import { IsOptional } from 'class-validator';

export class SavingsSummaryQueryDto {
  @IsOptional()
  readonly year?: string;
}
