import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { CookieOptions, Response } from 'express';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { AuthConfig } from '~auth/config/auth';
import type { User } from '~auth/entities/user.entity';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
  private options: CookieOptions;

  constructor(
    private readonly jwtService: JwtService,
    config: ConfigService<AuthConfig, true>,
  ) {
    this.options = config.get('cookie');
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<User>,
  ): Observable<User> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((user) => {
        const token = this.generateToken(user);

        response.cookie('token', token, this.options);

        return user;
      }),
    );
  }

  generateToken(user: User | Pick<User, 'id'>): string {
    return this.jwtService.sign({
      sub: user.id,
    });
  }
}
