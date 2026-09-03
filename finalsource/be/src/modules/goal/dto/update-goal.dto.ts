import { Type } from 'class-transformer';
import {
  IsDefined,
  IsDivisibleBy,
  IsNumber,
  Max,
  Min,
} from 'class-validator';

export class UpdateGoalDto {
  @Type(() => Number)
  @IsDefined()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(100_000)
  @Max(1_000_000_000)
  @IsDivisibleBy(10_000)
  readonly target_amount!: number;
}
