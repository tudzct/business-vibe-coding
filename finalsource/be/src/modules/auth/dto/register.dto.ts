import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

const fullNamePattern = /^\p{L}+(?: \p{L}+)*$/u;
const allowedPasswordPattern = /^[A-Za-z0-9!@#$%^&*(){}_=+\[\],./<>?\\|:;\-]+$/;
const passwordSpecialPattern = /[!@#$%^&*(){}\-_+=\[\],./<>?\\|:;]/;

export class RegisterDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.normalize('NFC').trim() : value)
  @IsString()
  @Length(4, 25)
  @Matches(fullNamePattern, { message: 'Full name may contain only Unicode letters separated by single spaces' })
  fullName!: string;

  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsString()
  @MaxLength(255)
  @IsEmail()
  email!: string;

  @IsString()
  @Length(8, 64)
  @Matches(/^\S+$/, { message: 'Password must not contain whitespace' })
  @Matches(/[a-z]/, { message: 'Password must contain a lowercase letter' })
  @Matches(/[A-Z]/, { message: 'Password must contain an uppercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain a digit' })
  @Matches(passwordSpecialPattern, { message: 'Password must contain a permitted special character' })
  @Matches(allowedPasswordPattern, { message: 'Password contains a character that is not permitted' })
  password!: string;

  @IsString()
  @MinLength(1)
  confirmPassword!: string;
}
