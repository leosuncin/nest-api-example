import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT_STRATEGY_NAME } from '~app/auth/constants';

@Injectable()
export class JWTAuthGuard extends AuthGuard(JWT_STRATEGY_NAME) {}
