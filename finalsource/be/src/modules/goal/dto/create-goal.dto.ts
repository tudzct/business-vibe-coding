import { Type } from 'class-transformer';
import {
  IsDateString,
  IsDivisibleBy,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Matches,
  Min,
} from 'class-validator';
import { GoalType } from '../goal.entity';

export class CreateGoalDto {
  @IsEnum(GoalType)
  readonly goal_type!: GoalType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly category_id?: number | null;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  readonly start_date!: string;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  readonly end_date!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(100_000)
  @Max(1_000_000_000)
  @IsDivisibleBy(10_000)
  readonly target_amount!: number;
}
