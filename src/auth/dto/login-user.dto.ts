import {
  IsDefined,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ValidateCredential } from '~auth/validators/validate-credential.validator';
import { Trim } from '~common/decorators/trim.decorator';

export class LoginUser {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @MinLength(8)
  @ValidateCredential()
  readonly password!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Matches(/^[\w.-]+$/iu)
  @MaxLength(30)
  @Trim()
  @ValidateCredential()
  readonly username!: string;
}
