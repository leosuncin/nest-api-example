import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from '~app/health.controller';
import { AuthModule } from '~auth/auth.module';
import { BlogModule } from '~blog/blog.module';
import { configuration } from '~config/configuration';
import { dataSource } from '~config/data-source';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      isGlobal: true,
      load: [configuration],
    }),
    TerminusModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(dataSource)],
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return config.getOrThrow('data-source');
      },
    }),
    AuthModule,
    BlogModule,
  ],
})
export class AppModule {}
