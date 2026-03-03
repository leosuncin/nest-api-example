import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { NormalizeEmail } from '~auth/decorators/normalize-email.decorator';
import { IsAlreadyRegister } from '~auth/validators/is-already-register.validator';
import { IsNotTheSame } from '~auth/validators/is-not-the-same';
import { IsNotVulnerable } from '~auth/validators/is-not-vulnerable.validator';
import { Trim } from '~common/decorators/trim.decorator';

export class RegisterUser {
  @IsAlreadyRegister()
  @IsDefined()
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  @NormalizeEmail()
  @Trim()
  readonly email!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNotTheSame<RegisterUser>('username')
  @IsNotVulnerable()
  @IsString()
  @MaxLength(30)
  @MinLength(8)
  readonly password!: string;

  @IsAlreadyRegister()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Matches(/^[\w.-]+$/iu)
  @MaxLength(30)
  @Trim()
  readonly username!: string;
}
