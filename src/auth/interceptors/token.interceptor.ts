import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { User } from '~auth/entities/user.entity';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<User>,
  ): Observable<User> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((user) => {
        const token = this.generateToken(user);

        response.cookie('token', token, {
          httpOnly: true,
          sameSite: 'strict',
          signed: true,
          secure: process.env.NODE_ENV === 'production',
        });

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
