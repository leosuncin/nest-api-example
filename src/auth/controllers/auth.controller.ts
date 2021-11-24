import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';

import { RegisterUser } from '@/auth/dto/register-user.dto';
import type { User } from '@/auth/entities/user.entity';
import { TokenInterceptor } from '@/auth/interceptors/token.interceptor';
import { AuthenticationService } from '@/auth/services/authentication.service';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor, TokenInterceptor)
export class AuthController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('/register')
  register(@Body() newUser: RegisterUser): Promise<User> {
    return this.authenticationService.register(newUser);
  }
}
