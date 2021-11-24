import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from '@/auth/controllers/auth.controller';
import { User } from '@/auth/entities/user.entity';
import { AuthenticationService } from '@/auth/services/authentication.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthenticationService],
  controllers: [AuthController],
})
export class AuthModule {}
