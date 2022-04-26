import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';

import { User } from '@/auth/entities/user.entity';
import { JwtPayload } from '@/auth/interfaces/jwt-payload.interface';
import { AuthenticationService } from '@/auth/services/authentication.service';

declare module 'express' {
  interface Request {
    cookies: Record<string, string | null>;
    signedCookies: Record<string, string | null>;
  }
}

export const JWT = 'jwt' as const;

const extractJwtFromCookie: JwtFromRequestFunction = (request) => {
  return request.signedCookies.token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT) {
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

  validate(payload: JwtPayload): Promise<User | undefined> {
    return this.authenticationService.verifyPayload(payload);
  }
}
