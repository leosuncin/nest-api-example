import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';

import { JWT_STRATEGY_NAME,TOKEN_COOKIE_NAME } from '~auth/constants';
import type { User } from '~auth/entities/user.entity';
import type { JwtPayload } from '~auth/interfaces/jwt-payload.interface';
import { AuthenticationService } from '~auth/services/authentication.service';

declare module 'express' {
  interface Request {
    cookies: Record<string, string | null>;
    signedCookies: Record<string, string | null>;
  }
}

const extractJwtFromCookie: JwtFromRequestFunction = (request) => {
  // eslint-disable-next-line security/detect-object-injection, @typescript-eslint/no-non-null-assertion
  return request.signedCookies[TOKEN_COOKIE_NAME]!;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY_NAME) {
  constructor(private readonly authenticationService: AuthenticationService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwtFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: process.env.SECRET,
      ignoreExpiration: false,
      passReqToCallback: false,
    });
  }

  validate(payload: JwtPayload): Promise<User | null> {
    return this.authenticationService.verifyPayload(payload);
  }
}
