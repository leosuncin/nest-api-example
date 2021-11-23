import { Transform } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUser {
  @Transform(({ value }): string =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(30)
  readonly password!: string;

  @Transform(({ value }): string =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Matches(/^[\w.-]+$/i)
  readonly username!: string;
}
