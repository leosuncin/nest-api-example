import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { CurrentUser } from '~auth/decorators/auth.decorator';
import { LoginUser } from '~auth/dto/login-user.dto';
import { RegisterUser } from '~auth/dto/register-user.dto';
import { UpdateUser } from '~auth/dto/update-user.dto';
import type { User } from '~auth/entities/user.entity';
import { JWTAuthGuard } from '~auth/guards/jwt-auth.guard';
import { CurrentUserInterceptor } from '~auth/interceptors/current-user.interceptor';
import { TokenInterceptor } from '~auth/interceptors/token.interceptor';
import { StripIdPipe } from '~auth/pipes/strip-id.pipe';
import { SwapPasswordPipe } from '~auth/pipes/swap-password.pipe';
import { AuthenticationService } from '~auth/services/authentication.service';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('/register')
  @UseInterceptors(TokenInterceptor)
  register(@Body() newUser: RegisterUser): Promise<User> {
    return this.authenticationService.register(newUser);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(TokenInterceptor)
  login(@Body() credentials: LoginUser): Promise<User> {
    return this.authenticationService.login(credentials);
  }

  @Get('/me')
  @UseGuards(JWTAuthGuard)
  currentUser(@CurrentUser() user: User): User {
    return user;
  }

  @Patch('/me')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(CurrentUserInterceptor)
  updateUser(
    @CurrentUser() user: User,
    @Body(StripIdPipe, SwapPasswordPipe) changes: UpdateUser,
  ): Promise<User> {
    return this.authenticationService.update(user, changes);
  }
}
