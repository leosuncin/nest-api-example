import {
  Allow,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { IsAlreadyRegister } from '~auth/validators/is-already-register.validator';
import { IsNotVulnerable } from '~auth/validators/is-not-vulnerable.validator';
import { ValidateCredential } from '~auth/validators/validate-credential.validator';

export class UpdateUser {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  readonly bio?: string;

  @IsAlreadyRegister()
  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  readonly email?: string;

  @Allow()
  id?: string;

  @IsOptional()
  @IsString()
  @IsUrl({
    allow_fragments: false,
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
  })
  readonly image?: string;

  @IsNotEmpty()
  @IsNotVulnerable()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @MinLength(8)
  readonly newPassword?: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @MinLength(8)
  @ValidateCredential()
  @ValidateIf((object: UpdateUser) => typeof object.newPassword === 'string')
  readonly password?: string;

  @IsAlreadyRegister()
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @Matches(/^[\w.-]+$/iu)
  @MaxLength(30)
  readonly username?: string;
}
