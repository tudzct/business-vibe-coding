import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

const monthValidationMessage =
  'Tham số month không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM (ví dụ: 2025-11)';

export class ExpenseBreakdownQueryDto {
  @ApiProperty({ example: '2025-11', pattern: '^\\d{4}-(0[1-9]|1[0-2])$' })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: monthValidationMessage,
  })
  month!: string;
}
