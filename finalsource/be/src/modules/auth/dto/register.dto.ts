import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  readonly fullName!: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @IsNotEmpty()
  readonly email!: string;

  @ApiProperty({ writeOnly: true })
  @IsString()
  @IsNotEmpty()
  readonly password!: string;

  @ApiProperty({ writeOnly: true })
  @IsString()
  @IsNotEmpty()
  readonly confirmPassword!: string;
}
