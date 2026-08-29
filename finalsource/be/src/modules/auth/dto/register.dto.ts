import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.normalize('NFC').trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @Length(4, 25)
  @Matches(/^\p{L}+(?: \p{L}+)*$/u, {
    message: 'fullName must contain only Unicode letters separated by single spaces',
  })
  readonly fullName!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsEmail()
  readonly email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 64)
  @Matches(/^[A-Za-z0-9!@#$%^&*(){}_+=\[\],./<>?\\|:;\-]+$/, {
    message: 'password contains a character that is not permitted',
  })
  @Matches(/[a-z]/, { message: 'password must contain a lowercase letter' })
  @Matches(/[A-Z]/, { message: 'password must contain an uppercase letter' })
  @Matches(/[0-9]/, { message: 'password must contain a digit' })
  @Matches(/[!@#$%^&*(){}\-_+=\[\],./<>?\\|:;]/, {
    message: 'password must contain a special character',
  })
  readonly password!: string;

  @IsString()
  @IsNotEmpty()
  readonly confirmPassword!: string;
}
