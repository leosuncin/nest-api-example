import { IsAlreadyRegister } from '~auth/validators/is-already-register.validator';
import { IsNotVulnerable } from '~auth/validators/is-not-vulnerable.validator';
import { ValidateCredential } from '~auth/validators/validate-credential.validator';
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

export class UpdateUser {
  @Allow()
  id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @IsAlreadyRegister()
  readonly email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Matches(/^[\w.-]+$/iu)
  @IsAlreadyRegister()
  readonly username?: string;

  @ValidateIf((object: UpdateUser) => typeof object.newPassword === 'string')
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(30)
  @ValidateCredential()
  readonly password?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(30)
  @IsNotVulnerable()
  readonly newPassword?: string;

  @IsOptional()
  @IsString()
  @IsUrl({
    allow_fragments: false,
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
  })
  readonly image?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly bio?: string;
}
