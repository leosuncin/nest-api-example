import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from '@/auth/controllers/auth.controller';
import { User } from '@/auth/entities/user.entity';
import { AuthenticationService } from '@/auth/services/authentication.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: {
        expiresIn: '30d',
      },
    }),
  ],
  providers: [AuthenticationService],
  controllers: [AuthController],
})
export class AuthModule {}
