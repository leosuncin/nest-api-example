import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/auth/auth.module';
import { BlogModule } from '@/blog/blog.module';

@Module({
  imports: [TypeOrmModule.forRoot(), AuthModule, BlogModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
