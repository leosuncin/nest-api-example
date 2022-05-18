import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { NormalizeEmail } from '@/auth/decorators/normalize-email.decorator';
import { IsAlreadyRegister } from '@/auth/validators/is-already-register.validator';
import { IsNotVulnerable } from '@/auth/validators/is-not-vulnerable.validator';
import { Trim } from '@/common/decorators/trim.decorator';

export class RegisterUser {
  @Trim()
  @NormalizeEmail()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @IsAlreadyRegister()
  readonly email!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(30)
  @IsNotVulnerable()
  readonly password!: string;

  @Trim()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Matches(/^[\w.-]+$/i)
  @IsAlreadyRegister()
  readonly username!: string;
}
