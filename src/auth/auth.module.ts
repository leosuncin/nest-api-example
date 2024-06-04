import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { auth, AuthConfig } from '~auth/config/auth';
import { AuthController } from '~auth/controllers/auth.controller';
import { User } from '~auth/entities/user.entity';
import {
  hasPasswordBeenPwned,
  PWNED_PASSWORD,
} from '~auth/providers/pwned-password.provider';
import { AuthenticationService } from '~auth/services/authentication.service';
import { JwtStrategy } from '~auth/strategies/jwt.strategy';
import { IsAlreadyRegisterConstraint } from '~auth/validators/is-already-register.validator';
import { IsNotVulnerableConstraint } from '~auth/validators/is-not-vulnerable.validator';
import { ValidateCredentialConstraint } from '~auth/validators/validate-credential.validator';

@Module({
  controllers: [AuthController],
  imports: [
    ConfigModule.forFeature(auth),
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService<AuthConfig>) {
        return config.getOrThrow('jwt');
      },
    }),
    PassportModule,
  ],
  providers: [
    AuthenticationService,
    IsAlreadyRegisterConstraint,
    ValidateCredentialConstraint,
    JwtStrategy,
    {
      provide: PWNED_PASSWORD,
      useValue: hasPasswordBeenPwned,
    },
    IsNotVulnerableConstraint,
  ],
})
export class AuthModule {}
