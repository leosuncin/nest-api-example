import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { JWT } from '~auth/strategies/jwt.strategy';

@Injectable()
export class JWTAuthGuard extends AuthGuard(JWT) {}
