import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MaxLength } from 'class-validator';

export class RegisterDto {
  @Transform(({ value }: TransformFnParams) => typeof value === 'string' ? value.normalize('NFC').trim() : value)
  @IsString()
  @IsNotEmpty()
  @Length(4, 25)
  @Matches(/^[\p{L}]+(?: [\p{L}]+)*$/u)
  fullName!: string;

  @Transform(({ value }: TransformFnParams) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 64)
  @Matches(/^\S+$/)
  @Matches(/[a-z]/)
  @Matches(/[A-Z]/)
  @Matches(/[0-9]/)
  @Matches(/[!@#$%^&*(){}\-_+=\[\],./<>?\\|:;]/)
  @Matches(/^[A-Za-z0-9!@#$%^&*(){}_=+\[\],./<>?\\|:;\-]+$/)
  password!: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword!: string;
}
